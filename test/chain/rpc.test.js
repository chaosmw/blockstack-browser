import Rpc from '../../app/js/chain'
// TODO
// npm test test/chain/rpc.test.js
describe('rpc of node should work', () => {
    it('query balance should be ok', () => {
        let address = '5Ck8GsPfMaFZGMYBfUeyoBCk94Yr2RYSLm7yZp6vUVcNVSau'
        let nodeUrl = 'ws://127.0.0.1:9944'
        Rpc.queryBalance(address, nodeUrl).catch(console.error) 
    })
})