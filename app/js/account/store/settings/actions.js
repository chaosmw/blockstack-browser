import DEFAULT_API from './default'
import * as types from './types'
import log4js from 'log4js'
import { selectApi } from '@common/store/selectors/settings'
import { selectIdentityKeypairs } from '@common/store/selectors/account'
import { selectLocalIdentities } from '@common/store/selectors/profiles'
import { connectToGaiaHub } from '../../utils/blockstack-inc'
import { BLOCKSTACK_INC } from '../../utils'
import { setCoreStorageConfig } from '@utils/api-utils'
import AccountActions from '../account/actions'

const logger = log4js.getLogger(__filename)

function updateApi(api) {
  return {
    type: types.UPDATE_API,
    api
  }
}

function updateBtcPrice(price) {
  return {
    type: types.UPDATE_BTC_PRICE,
    price
  }
}

function updatePtsPrice(price) {
  return {
    type: types.UPDATE_PTS_PRICE,
    price
  }
}

function refreshBtcPrice(btcPriceUrl) {
  return dispatch => (
    fetch(btcPriceUrl)
      .then(response => response.text())
      .then(responseText => JSON.parse(responseText))
      .then(responseJson => {
        dispatch(updateBtcPrice(responseJson.last))
      })
      .catch(error => {
        logger.error('refreshBtcPrice:', error)
      })
  )
}

function refreshPtsPrice(ptsPriceUrl) {
  return dispatch => (
    fetch(ptsPriceUrl)
      .then(response => response.text())
      .then(responseText => JSON.parse(responseText))
      .then(responseJson => {
        dispatch(updatePtsPrice(responseJson.last))
      })
      .catch(error => {
        logger.error('refreshPtsPrice:', error)
      })
  )
}

function resetApi(api) {
  logger.info('resetApi')
  let coreAPIPassword = api.coreAPIPassword
  let gaiaHubConfig = api.gaiaHubConfig

  if (gaiaHubConfig === undefined) {
    gaiaHubConfig = null
  }

  if (coreAPIPassword === undefined) {
    coreAPIPassword = DEFAULT_API.coreAPIPassword
  }
  return dispatch => {
    dispatch(
      updateApi(
        Object.assign({}, DEFAULT_API, {
          gaiaHubConfig,
          coreAPIPassword
        })
      )
    )
  }
}

function connectStorage(customGaiaUrl) {
  return async (dispatch, getState) => {
    logger.info('connectStorage')
    const state = getState()
    const api = selectApi(state)
    let idKeypairs = selectIdentityKeypairs(state)

    if (!idKeypairs || !idKeypairs[0] || !idKeypairs[0].key) {
      logger.warn('connectStorage: no keypairs, bailing out')
      return Promise.reject()
    }

    const gaiaHubUrl = customGaiaUrl || api.gaiaHubUrl

    return connectToGaiaHub(gaiaHubUrl, idKeypairs[0].key).then(gaiaHubConfig => {
      const newApi = Object.assign({}, api, {
        gaiaHubConfig,
        gaiaHubUrl,
        hostedDataLocation: BLOCKSTACK_INC
      })
      dispatch(updateApi(newApi))

      idKeypairs = selectIdentityKeypairs(state)
      const localIdentities = selectLocalIdentities(state)

      const identityIndex = 0
      const identity = localIdentities[identityIndex]
      const identityAddress = identity.ownerAddress
      const profileSigningKeypair = idKeypairs[identityIndex]
      const profile = identity.profile
      setCoreStorageConfig(
        newApi,
        identityIndex,
        identityAddress,
        profile,
        profileSigningKeypair,
        identity
      )
      logger.debug('connectStorage: storage initialized')

      const newApi2 = Object.assign({}, newApi, { storageConnected: true })
      dispatch(updateApi(newApi2))
      dispatch(AccountActions.storageIsConnected())
      logger.debug('connectStorage: storage configured')
    })
  }
}

const SettingsActions = {
  refreshBtcPrice,
  refreshPtsPrice,
  resetApi,
  updateApi,
  updateBtcPrice,
  updatePtsPrice,
  connectStorage
}

export default SettingsActions
