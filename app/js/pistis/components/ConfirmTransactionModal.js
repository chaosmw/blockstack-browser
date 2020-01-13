import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { AccountActions } from '../../account/store/account'
import SimpleButton from '@components/SimpleButton'


class ConfirmTransactionModal extends React.Component {
  broadcastTransaction = () => {
    const {signer, recipientAddress, amount} = this.props.data
    this.props.buildAndBroadcastPistisTransferTransaction(signer, recipientAddress, amount, this.props.ptsNodeUrl)
  }

  render() {
    const { isOpen, handleClose, txHex, isBroadcasting } = this.props
    // const data = txHex && summarizeTransactionFromHex(txHex)
    const data = this.props.data

    return (
      <Modal
        className="container-fluid"
        isOpen={isOpen}
        onRequestClose={handleClose}
      >
        <h3 className="modal-heading">
          Confirm Transaction
        </h3>
        <div className="modal-body">
          {data &&
            <p>
              Are you sure you want to send{' '}
              <strong>{data.amount} DEV</strong>
              {' '}to{' '}
              <code>{data.recipientAddress}</code>?
            </p>
          }
        </div>
        <SimpleButton type="primary" loading={isBroadcasting} onClick={this.broadcastTransaction} block>
          Confirm
        </SimpleButton>
        <SimpleButton type="tertiary" onClick={handleClose} block>
          Cancel
        </SimpleButton>
      </Modal>
    )
  }
}

ConfirmTransactionModal.propTypes = {
  // Own props
  isOpen: PropTypes.bool,
  txHex: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
  // Redux props
  regTestMode: PropTypes.bool,
  isBroadcasting: PropTypes.bool,
  broadcastBitcoinTransaction: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  buildAndBroadcastPistisTransferTransaction: PropTypes.func.isRequired,
  ptsNodeUrl: PropTypes.string.isRequired,
}

function mapStateToProps(state) {
  return {
    account: state.account,
    regTestMode: state.settings.api.regTestMode,
    ptsNodeUrl: state.settings.api.ptsNodeUrl,
    isBroadcasting: state.account.coreWallet.withdrawal.isBroadcasting
  }
}

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators({ ...AccountActions }, dispatch)
)(ConfirmTransactionModal)
