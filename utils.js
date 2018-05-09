function lookupServiceMetadata(service, implementation) {
    const lowercase = coll => {
        return coll.map(k => {
            return k.toLowerCase()
        })
    }
    const serviceKeys = Object.keys(service);
    const implementationKeys = Object.keys(implementation);
    const intersectingMethods = lowercase(serviceKeys)
                    .filter(k => lowercase(implementationKeys).indexOf(k) !== -1)
                    .reduce((acc, k) => {
                        const method = service[k];
                        const components = method.path.split('/') 
                        acc[k] = {
                            service: components[1],
                            method: components[2],
                        };
                        return acc;
                    }, {});

    return key => Object.keys(intersectingMethods)
                    .filter(k => key.toLowerCase() === k)
                    .map(k => intersectingMethods[k]).pop();
}

module.exports = {
    lookupServiceMetadata,
}
