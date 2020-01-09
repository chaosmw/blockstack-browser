const ExtendedTypes = {
    'NodeRecord': {
        'owner': 'AccountId',
        'ttl': 'u64'
    },
    'ResolveRecord': {
        'addr': 'AccountId',
        'name': 'Vec<u8>',
        'profile': 'H256',
        'zone': 'Vec<u8>'
    },
    'NameHash': 'H256',
    'BusinessOf': {
        'creator': 'AccountId',
        'owner': 'NameHash',
        'name': 'Vec<u8>',
        'whitelist': 'Vec<NameHash>',
        'expiration': 'u64'
    },
    'ProductInfo': {
        'creator': 'AccountId',
        'created_at': 'u64',
        'data_hash': 'H256',
        'extra': 'Vec<u8>'
    },
    'ProductOf': {
        'seq_id': 'Vec<u8>',
        'infos': 'Vec<ProductInfo>'
    }
}

export default ExtendedTypes