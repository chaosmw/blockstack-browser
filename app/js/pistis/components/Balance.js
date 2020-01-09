import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { AccountActions } from '../../account/store/account'
import { SettingsActions } from '../../account/store/settings'
import currencyFormatter from 'currency-formatter'
import roundTo from 'round-to'

import log4js from 'log4js'

const logger = log4js.getLogger(__filename)

const UPDATE_BALANCE_INTERVAL = 30000

function mapStateToProps(state) {
  return {
    addresses: state.account.pistisAccount.addresses,
    balances: state.account.pistisAccount.balances,
    ptsBalanceUrl: state.settings.api.ptsBalanceUrl,
    ptsPriceUrl: state.settings.api.ptsPriceUrl,
    ptsPrice: state.settings.api.ptsPrice,
    coreAPIPassword: state.settings.api.coreAPIPassword
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AccountActions, SettingsActions), dispatch)
}

class Balance extends Component {
  static propTypes = {
    addresses: PropTypes.array.isRequired,
    balances: PropTypes.object.isRequired,
    refreshPtsBalances: PropTypes.func.isRequired,
    ptsBalanceUrl: PropTypes.string.isRequired,
    ptsPriceUrl: PropTypes.string.isRequired,
    ptsPrice: PropTypes.string.isRequired,
    refreshPtsPrice: PropTypes.func.isRequired,
    coreAPIPassword: PropTypes.string
  }

  constructor() {
    super()
    this.ptsBalance = this.ptsBalance.bind(this)
    this.roundedPtsBalance = this.roundedPtsBalance.bind(this)
    this.usdBalance = this.usdBalance.bind(this)
  }

  componentDidMount() {
    logger.debug(`[hsiung] ${this.props.ptsBalanceUrl}, ${this.props.addresses}`)
    this.props.refreshPtsBalances(this.props.ptsBalanceUrl, this.props.addresses)
    this.props.refreshPtsPrice(this.props.ptsPriceUrl)
    this.balanceTimer = setInterval(() => {
      logger.debug('balanceTimer: calling refreshPtsBalances...')
      this.props.refreshPtsBalances(this.props.ptsBalanceUrl, this.props.addresses)
      this.props.refreshPtsPrice(this.props.ptsPriceUrl)
    }, UPDATE_BALANCE_INTERVAL)
  }

  componentWillUnmount() {
    logger.debug('componentWillUnmount: clearing balanceTimer...')
    clearTimeout(this.balanceTimer)
  }

  ptsBalance() {
    let ptsBalance = 0
    const balances = this.props.balances
    if (balances && balances.total) {
      ptsBalance = balances.total
    }
    return ptsBalance
  }

  roundedPtsBalance() {
    const ptsBalance = this.ptsBalance()
    if (!ptsBalance) {
      return 0
    } else {
      const roundedAmount = roundTo(ptsBalance, 6)
      return roundedAmount
    }
  }

  usdBalance() {
    let ptsPrice = this.props.ptsPrice
    const ptsBalance = this.ptsBalance()

    ptsPrice = Number(ptsPrice)
    const usdBalance = ptsPrice * ptsBalance
    return currencyFormatter.format(usdBalance, { code: 'USD' })
  }

  render() {
    return (
      <div className="balance m-b-30">
        <div className="balance-sml">
          Balance
        </div>
        <div className="balance-main" title={`${this.ptsBalance()} DEV`}>
          {this.roundedPtsBalance()}
          <label>&nbsp;DEV</label>
        </div>
        <div className="balance-sml">
          {this.usdBalance()}
          <label>&nbsp;USD</label>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Balance)
