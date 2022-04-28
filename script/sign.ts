// https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/baseTransaction.ts
// https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/legacyTransaction.ts


// baseTransaction : https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/baseTransaction.ts#L298
sign(privateKey: Buffer): TransactionObject {
    if (privateKey.length !== 32) {
        const msg = this._errorMsg('Private key must be 32 bytes in length.')
        throw new Error(msg)
    }

    // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
    // and want to recreate a signature (where EIP155 should be applied)
    // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
    // 2021-06-23
    let hackApplied = false
    if (
        this.type === 0 &&
        this.common.gteHardfork('spuriousDragon') &&
        !this.supports(Capability.EIP155ReplayProtection)
    ) {
        this.activeCapabilities.push(Capability.EIP155ReplayProtection)
        hackApplied = true
    }

    const msgHash = this.getMessageToSign(true)
    const { v, r, s } = ecsign(msgHash, privateKey)
    const tx = this._processSignature(v, r, s)

    // Hack part 2
    if (hackApplied) {
        const index = this.activeCapabilities.indexOf(Capability.EIP155ReplayProtection)
        if (index > -1) {
            this.activeCapabilities.splice(index, 1)
        }
    }

    return tx
}

// getMessageToSign : https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/legacyTransaction.ts#L225
getMessageToSign(hashMessage: false): Buffer[]
getMessageToSign(hashMessage?: true): Buffer
getMessageToSign(hashMessage = true) {
    const message = this._getMessageToSign()
    if (hashMessage) {
        return rlphash(message)
    } else {
        return message
    }
}

private _getMessageToSign() {
    const values = [
        bnToUnpaddedBuffer(this.nonce),
        bnToUnpaddedBuffer(this.gasPrice),
        bnToUnpaddedBuffer(this.gasLimit),
        this.to !== undefined ? this.to.buf : Buffer.from([]),
        bnToUnpaddedBuffer(this.value),
        this.data,
    ]

    if (this.supports(Capability.EIP155ReplayProtection)) {
        values.push(toBuffer(this.common.chainIdBN()))
        values.push(unpadBuffer(toBuffer(0)))
        values.push(unpadBuffer(toBuffer(0)))
    }

    return values
}




// ecsign : https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/signature.ts#L25
export function ecsign(msgHash: Buffer, privateKey: Buffer, chainId?: number): ECDSASignature
export function ecsign(msgHash: Buffer, privateKey: Buffer, chainId: BNLike): ECDSASignatureBuffer
export function ecsign(msgHash: Buffer, privateKey: Buffer, chainId: any): any {
    const { signature, recid: recovery } = ecdsaSign(msgHash, privateKey)

    const r = Buffer.from(signature.slice(0, 32))
    const s = Buffer.from(signature.slice(32, 64))

    if (!chainId || typeof chainId === 'number') {
        // return legacy type ECDSASignature (deprecated in favor of ECDSASignatureBuffer to handle large chainIds)
        if (chainId && !Number.isSafeInteger(chainId)) {
            throw new Error(
                'The provided number is greater than MAX_SAFE_INTEGER (please use an alternative input type)'
            )
        }
        const v = chainId ? recovery + (chainId * 2 + 35) : recovery + 27
        return { r, s, v }
    }

// ecdsaSign
// https://github.com/ethereum/js-ethereum-cryptography/blob/master/src/secp256k1.ts
    export function ecdsaSign(
        msgHash: Uint8Array,
        privateKey: Uint8Array,
        options = { noncefn: undefined, data: undefined },
        out?: Output
    ): Signature {
        assertBytes(msgHash, 32);
        assertBytes(privateKey, 32);
        if (typeof options !== "object" || options === null) {
            throw new TypeError("secp256k1.ecdsaSign: options should be object");
        }
        // noble-secp256k1 uses hmac instead of hmac-drbg here
        if (
            options &&
            (options.noncefn !== undefined || options.data !== undefined)
        ) {
            throw new Error("Secp256k1: noncefn && data is unsupported");
        }
        const [signature, recid] = secp.signSync(msgHash, privateKey, {
            recovered: true,
            der: false
        });
        return { signature: output(out, 64, signature), recid };
    }


// signSync : https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts
// Two methods because some people cannot use async sign
    function signSync(msgHash: Hex, privKey: PrivKey, opts: OptsRecov): [U8A, number];
    function signSync(msgHash: Hex, privKey: PrivKey, opts?: OptsNoRecov): U8A;
    function signSync(msgHash: Hex, privKey: PrivKey, opts: Opts = {}): SignOutput {
        // Steps A, D of RFC6979 3.2.
        const { seed, m, d } = initSigArgs(msgHash, privKey, opts.extraEntropy);
        let sig: RecoveredSig | undefined;
        // Steps B, C, D, E, F, G
        const drbg = new HmacDrbg();
        drbg.reseedSync(seed);
        // Step H3, repeat until k is in range [1, n-1]
        while (!(sig = kmdToSig(drbg.generateSync(), m, d))) drbg.reseedSync();
        return finalizeSig(sig, opts);
    }
    export { sign, signSync };




// output : https://github.com/ethereum/js-ethereum-cryptography/blob/c2987b36544c5fd2cbba6b36b148f98071bc6bfa/src/secp256k1-compat.ts#L34
    function output(
        out: Output = (len: number) => new Uint8Array(len),
        length: number,
        value?: Uint8Array
    ) {
        if (typeof out === "function") {
            out = out(length);
        }
        assertBytes(out, length);
        if (value) {
            out.set(value);
        }
        return out;
    }