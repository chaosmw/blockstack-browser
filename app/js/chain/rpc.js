const { ApiPromise, WsProvider } = require('@polkadot/api')
import ExtendedTypes from './extended_types'
import log4js from 'log4js'
const logger = log4js.getLogger(__filename)


async function init(nodeUrl) {
    logger.info(`connect to ${nodeUrl} ...`);
    const provider = new WsProvider(nodeUrl);
    // Register custom types
    let options = {
        provider: provider,
        types: ExtendedTypes, 
    };

    const api = await ApiPromise.create(options);
    logger.info(`connected to ${nodeUrl}`);

    return api;
}

async function queryBalance(address, nodeUrl) {
   logger.info(`query balance of ${address} from node ${nodeUrl} ...`);
   const api = await init(nodeUrl);
   const response = await api.query.balances.freeBalance(address);
   logger.info(`query balance results: ${response}`);
   return response;
}

const Rpc = {
    queryBalance
}

export default Rpc