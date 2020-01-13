import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { QRCode } from 'react-qr-svg'

import { AccountActions } from '../account/store/account'
import Balance            from './components/Balance'

function mapStateToProps(state) {
  return {
    addresses: state.account.pistisAccount.addresses,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AccountActions, dispatch)
}

class ReceivePage extends Component {
  static propTypes = {
    addresses: PropTypes.array.isRequired,
  }

  componentWillMount() {
  }

  render() {
    const address = this.props.addresses[0]

    return (
      <div>
        <Balance />
        {address ?
          <div>
            <div className="qrcode-wallet">
              <QRCode
                value={address}
              />
            </div>
            <div className="highlight-wallet text-center">
              <pre>
                <code>{address}</code>
              </pre>
            </div>
          </div>
        :
          <div>
            <h5>Loading address...</h5>
          </div>
        }
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceivePage)
