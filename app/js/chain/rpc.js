const { ApiPromise, WsProvider } = require('@polkadot/api')
import ExtendedTypes from './extended_types'
import log4js from 'log4js'
const logger = log4js.getLogger(__filename)


async function init(nodeUrl) {
    logger.info(`connect to ${nodeUrl} ...`);
    const provider = new WsProvider(nodeUrl, false);
    const api = await new Promise(async (resolve, reject) => {
        provider.on('error', (error) => {
            logger.error('Pistis init provider error');
            reject(new Error('Failed to init connection with node'));
        })
        provider.connect();
        // Register custom types
        let options = {
            provider: provider,
            types: ExtendedTypes, 
        };

        const api = await ApiPromise.create(options);
        logger.info(`connected to ${nodeUrl}`);
        resolve(api);
    })
        
    return api;
}

async function queryBalance(address, nodeUrl) {
   logger.info(`query balance of ${address} from node ${nodeUrl} ...`);
   const api = await init(nodeUrl);
   const response = await api.query.balances.freeBalance(address);
   logger.info(`query balance results: ${response}`);
   return response;
}

async function transfer(signer, to, amount, nodeUrl) {
    let from = signer.address
    logger.info(`transfer ${amount} DEV from ${from} to ${to} via ${nodeUrl} ...`)
    const api = await init(nodeUrl)
    const action = api.tx.balances.transfer(to, amount)
    const txHash = await action.signAndSend(signer)
    // const unsubscribe = await action.signAndSend(signer, ({ events = [], status }) => {
    //     logger.info('transaction status:', status.type);

    //     if (status.isFinalized) {
    //         logger.info('completed at block hash', status.asFinalized.toHex());
    //     } else {
    //         logger.info(`status of transfer: ${status.type}`)
    //     }
    //     // Output events if any
    //     if (events.length > 0) {
    //         logger.info('events:');
    //         events.forEach(({ phase, event: { data, method, section } }) => {
    //             logger.info('\t', phase.toString(), `:${section}.${method}`, data.toString());
    //         });
    //     }
    // });
    logger.info(`transfer txHash:${txHash}`)
    return txHash.toString()
}

const Rpc = {
    queryBalance,
    transfer
}

export default Rpc