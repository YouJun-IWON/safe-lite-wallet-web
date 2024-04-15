/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useWalletClient, useWaitForTransactionReceipt } from "wagmi"; // 지갑 클라이언트의 데이터 로딩 상태 관리
import * as safeLiteAbi from '@/abi/safeLite.json';
import { useEffect, useState } from "react";
import { isAddress } from "web3-validator";
import { useSafeLite } from "@/hooks/useSafeLite";

export default function CreateWallet() {
    const { data: walletClient, isError, isLoading } = useWalletClient()
    const [safeLiteDeployTxHash, setSafeLiteDeployTxHash] = useState('')
    const result = useWaitForTransactionReceipt({
        hash: safeLiteDeployTxHash as `0x${string}`,
    })
    const [threshold, setThreshold] = useState(0)
    const [owners, setOwners] = useState<`0x${string}`[]>(['0x',])
    useSafeLite(result?.data?.contractAddress ? result?.data?.contractAddress : undefined)

    const createHandler = async () => { // 지갑 생성 함수
        let invalidAddr = ''
        owners.map((owner) => {
            if (!isAddress(owner)) {
                invalidAddr = owner
            }
        })
        if (invalidAddr) {
            alert('Invalid address: ' + invalidAddr)
            return
        }
        if (threshold <= 0 || threshold > owners.length) {
            alert('Invalid threshold: ' + threshold)
            return
        }
        const contract = await walletClient?.deployContract({
            abi: safeLiteAbi.abi,
            bytecode: safeLiteAbi.bytecode as `0x${string}`,
            args: [1001, owners, threshold],
        })
        setSafeLiteDeployTxHash(contract ? contract : '')
        if (result.isFetched && result?.status !== 'success') {
            alert('Wallet Creation failed' + result?.error)
        }
    }

    useEffect(() => {
        const newOwners = owners.slice()
        if (walletClient?.account.address) {
            newOwners[0] = walletClient?.account.address
            setOwners(newOwners)
        }
    }, [walletClient?.account.address])
    
    const ownerList = []
    for (let i = 0; i < owners.length; i++) {
        ownerList.push(
            <li key={i}>
                <input
                    {...i === 0 ? { readOnly: true } : {}}
                    type="text"
                    value={owners[i]}
                    onChange={(e) => {
                        const newOwners = owners.slice()
                        newOwners[i] = e.target.value as `0x${string}`
                        setOwners(newOwners)
                    }}
                />
            </li>
        )
    }

    return (
        <div>
            <h1>Create Wallet</h1>
            <ul>
                <h3>Owners</h3>
                <button onClick={() => {
                    setOwners(owners.concat('' as `0x${string}`))
                }}>
                    Add
                </button>
                <button onClick={() => {
                    if (owners.length === 1) {
                        alert('Cannot delete the first owner')
                        return
                    }
                    setOwners(owners.slice(0, owners.length - 1))
                }}>
                    Delete
                </button>
                {ownerList}
                <h3>Threshold</h3>
                <input
                    type="number"
                    value={threshold}
                    onChange={(e) => {
                        setThreshold(parseInt(e.target.value))
                    }}
                />
            </ul>
            <button onClick={createHandler}>Create</button>
        </div>
    );
}