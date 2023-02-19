import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, CONTRACT_ADDRESS } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
balanceButton.onclick = balance
fundButton.onclick = fund
withdrawButton.onclick = withdraw
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected"
        } catch (error) {
            console.log(error)
        }
    } else {
        connectButton.innerHTML = "Please install  MetaMask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ETH`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // Wait for the transaction to be mined
            console.log("BEGIN!")
            await listenForTransactionMine(transactionResponse, provider)
            console.log("DONE!")
        } catch (error) {
            console.log(`Got error ${error}`)
        }
        console.log("FINISHED!")
    }
}

async function balance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(CONTRACT_ADDRESS)
        console.log(ethers.utils.formatEther(balance))
    }
}
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer)
        try {
            const transactionResponse = await contract.cheaperWithdraw()
            // Wait for the transaction to be mined
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(`Got error ${error}`)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining transaction ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Transaction mined ${transactionReceipt.confirmations}`)
            resolve()
        })
    })
}
