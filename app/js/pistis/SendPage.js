import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  decryptMnemonic,
  getSubstrateKeyring
} from '../utils'
import log4js from 'log4js'

import { AccountActions } from '../account/store/account'

import Alert from '@components/Alert'
import InputGroupSecondary from '@components/InputGroupSecondary'
import Balance from './components/Balance'
import ConfirmTransactionModal from './components/ConfirmTransactionModal'
import SimpleButton from '@components/SimpleButton'

const logger = log4js.getLogger(__filename)

function mapStateToProps(state) {
  return {
    account: state.account,
    regTestMode: state.settings.api.regTestMode,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AccountActions), dispatch)
}

class SendPage extends Component {
  static propTypes = {
    account: PropTypes.object.isRequired,
    regTestMode: PropTypes.bool.isRequired,
    // localIdentites: PropTypes.array.isRequired,
    resetCoreWithdrawal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      alerts: [],
      amount: '',
      password: '',
      recipientAddress: '',
      signer: null,
      isConfirming: false
    }
  }

  componentWillMount() {
    this.props.resetCoreWithdrawal()
  }

  componentWillReceiveProps(nextProps) {
    // Handle changes in withdrawal state
    if (this.props.account.coreWallet) {
      const thisWithdrawal = this.props.account.coreWallet.withdrawal
      const nextWithdrawal = nextProps.account.coreWallet.withdrawal

      logger.info(`componentWillReceiveProps: thisWithdrawal: ${JSON.stringify(thisWithdrawal)} \n nextWithdrawal: ${JSON.stringify(nextWithdrawal)}`)

      if (nextWithdrawal.txHex && thisWithdrawal.txHex !== nextWithdrawal.txHex) {
        this.setState({ isConfirming: false })
      }
      else if (nextWithdrawal.error && thisWithdrawal.error !== nextWithdrawal.error) {
        this.updateAlert('danger', nextWithdrawal.error)
        this.closeConfirmation()
      }
      else if (!thisWithdrawal.success && nextWithdrawal.success) {
        this.closeConfirmation()
        this.reset() 
        this.updateAlert('success', 'Your transaction was succesfully broadcasted!')
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCoreWithdrawal()
  }

  onValueChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  updateAlert = (alertStatus, alertMessage) => {
    this.setState({
      alerts: [{
        status: alertStatus,
        message: alertMessage
      }]
    })
  }

  reset() {
    this.setState({
      amount: '',
      password: '',
      recipientAddress: '',
    })
  }

  prepareTransaction = (event) => {
    event.preventDefault()
    const { password, amount, recipientAddress } = this.state
    const { account, regTestMode } = this.props
    const ptsAddress = account.pistisAccount.addresses[0]
    const balance = account.pistisAccount.balances[ptsAddress]

    if (!password || !amount || !recipientAddress) {
      this.updateAlert('danger', 'All fields are required')
      return
    }

    if (parseFloat(amount) > balance) {
      this.updateAlert(
        'danger',
        'Amount exceeds balance. Use "Send all" if you’d like to send the maximum amount.'
      )
      return
    }

    // TODO: Move decrypt logic to action & blockstack.js
    this.setState({
      disabled: true,
      alerts: []
    })
    decryptMnemonic(password, account.encryptedBackupPhrase)
      .then(backupPhrase => {
        // FIXME: 
        const { substrateKeyring, substrateAddresses } = getSubstrateKeyring(backupPhrase, 1)
        let signer = substrateKeyring.getPair(ptsAddress)
        this.setState({
          signer: signer,
          isConfirming: true
        })
      })
      .catch(error => {
        this.updateAlert(
          'danger',
          error.message
        )
        this.closeConfirmation()
      })
  }

  closeConfirmation = () => {
    this.setState({
      signer: null,
      isConfirming: false,
      disabled: false
    })
  }

  setAmountAll = () => {
    const { pistisAccount } = this.props.account
    const ptsAddress = pistisAccount.addresses[0]
    this.setState({ amount: pistisAccount.balances[ptsAddress].toString() })
  }

  render() {
    const { pistisAccount } = this.props.account
    const { isConfirming, disabled } = this.state
    const ptsAddress = pistisAccount.addresses[0]
    const balance = pistisAccount.balances[ptsAddress]

    return (
      <div>
        <Balance />
        {this.state.alerts.map(alert =>
          <Alert key={alert.message} message={alert.message} status={alert.status} />
        )}
        <form onSubmit={this.prepareTransaction}>
          <InputGroupSecondary
            data={this.state}
            onChange={this.onValueChange}
            name="recipientAddress"
            label="To"
            placeholder="&nbsp;"
            required
          />
          <InputGroupSecondary
            data={this.state}
            onChange={this.onValueChange}
            name="amount"
            label="Amount"
            placeholder="&nbsp;"
            type="number"
            required
            step={1e-8}
            min="0"
            action={balance ? {
              text: 'Send all',
              onClick: this.setAmountAll
            } : null}
          />
          <InputGroupSecondary
            data={this.state}
            onChange={this.onValueChange}
            name="password"
            label="Password"
            placeholder="&nbsp;"
            type="password"
            required
          />
          <div className="m-t-40 m-b-75">
            <SimpleButton type="primary" block loading={disabled}>
              Make transaction
            </SimpleButton>
          </div>
        </form>

        <ConfirmTransactionModal
          isOpen={isConfirming}
          handleClose={this.closeConfirmation}
          txHex={this.props.account.coreWallet.withdrawal.txHex} 
          data={{signer: this.state.signer, recipientAddress: this.state.recipientAddress, amount: this.state.amount}}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPage)
