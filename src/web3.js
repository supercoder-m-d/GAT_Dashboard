import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/"));
export default web3;
let web3Main;
if(window.ethereum)
    web3Main = new Web3(window.ethereum);
export {web3Main}