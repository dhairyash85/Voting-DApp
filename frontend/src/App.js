import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react'
import {contractABI, contractAddress} from "./Constant/Constants";
import Login from "./Components/Login" 
import {ethers} from 'ethers'
import Connected from './Components/Connected';

function App() {
  const [provider, setProvider]=useState(null)
  const [account, setAccount]=useState(null)
  const [isConnected, setIsConnected]=useState(false);
  const [votingStatus, setVotingStatus]=useState(true)
  const [remainingTime, setRemainingTime]=useState("")
  const [candidates, setCandidates]=useState([])
  const [number, setNumber]=useState()
  const [canVote, setCanVote]=useState(true)
  async function connectWallet(){
    if(window.ethereum){
      try{
        const provider= new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        await provider.send("eth_requestAccounts", []);
        const signer= provider.getSigner()
        const address=await signer.getAddress()
        setAccount(address)
        console.log("Metamask Connnected " + address)
        setIsConnected(true)
        await checkCanVote()
      }catch(err){
        console.log(err)
      }
    }else{
      console.error("Metamask not detected")
    }
  }
  useEffect(()=>{
    getCandidates()
    getRemainingTime()
    getCurrentStatus()
    if(window.ethereum){
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return()=>{
      if(window.ethereum){
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  })
  function handleAccountsChanged(accounts){
    if(accounts.length>0 && account!=accounts[0]){
      setAccount(accounts[0])
      canVote()
    }else{
      setIsConnected(false)
      setAccount(null)
    }
  }

  async function getCurrentStatus(){
    const provider= new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer= provider.getSigner()
    const contractIntance=new ethers.Contract(contractAddress,contractABI, signer)
    const status=await contractIntance.getVotingStatus();
    setVotingStatus(status)
  }

  async function getRemainingTime(){
    const provider= new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer= provider.getSigner()
    const contractIntance=new ethers.Contract(contractAddress,contractABI, signer)
    const time =await contractIntance.getRemainingTime();
    setRemainingTime(parseInt(time, 16))
  }

  async function getCandidates(){
    const provider= new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer= provider.getSigner()
    const contractIntance=new ethers.Contract(contractAddress,contractABI, signer)
    const candidateList=await contractIntance.getAllVotesOfCandiates()
    const formattedCandidates=candidateList.map((candidate, index)=>{
      return {
        index: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber()
      }
    })
    setCandidates(formattedCandidates)
    
  }
  
  async function handleNumberChange(e){
    setNumber(e.target.value)

  }

  async function checkCanVote(){
    const provider= new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer= provider.getSigner()
    const contractIntance=new ethers.Contract(contractAddress,contractABI, signer)
    const voteStatus=await contractIntance.voters(await signer.getAddress())
    setCanVote(voteStatus)
  }

  async function voteFunction(){
    const provider= new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer= provider.getSigner()
    const contractIntance=new ethers.Contract(contractAddress,contractABI, signer)
    const tx=await contractIntance.vote(number)
    await tx.wait()
    await checkCanVote()
  }

  return (
    <div className="App">
      {isConnected ? (<Connected account={account} candidates={candidates} remainingTime={remainingTime} number={number} handleNumberChange={handleNumberChange} canVote={canVote} voteFunction={voteFunction}/>):(<Login connectWallet={connectWallet}/>)}
    </div>
  );
}

export default App;
