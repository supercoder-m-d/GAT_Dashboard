import React, { useEffect, useState, useCallback } from 'react';
import './Main.css';
import { useSelector } from 'react-redux';
import web3 from '../../web3';
import priceFeed from '../../priceFeed';
import payday from '../../payday';
import { paydTx } from '../../payday';
import pancakeswap from '../../pancakeswap';
import img1 from '../../images/busd.png';
import img2 from '../../images/money.png';

let priceTImer = null;
let infoTimer = null;
function Main(props) {
    const toggleDefault = useSelector(state => state.toggle.value)
    const {currentAddress, onAddressChange} = props;
    const [paydHoldings, setPaydHoldings] = useState(0);
    const [busdPaid, setBUSDPaid] = useState(0);
    const [lastPayoutTime, setLastPayoutTime] = useState('Never');
    const [nextPayoutLoading, setNextPayoutLoading] = useState(0);
    const [totalBUSDPaid, setTotalBUSDPaid] = useState('0');
    const [tokenPrice, setTokenPrice] = useState(0);
    const [nextPayoutAmount, setNextPayoutAmount] = useState('Processing');
    const [busdPrice, setBusdPrice] = useState(0);
    const [paid, setPaid] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [bnbBalance, setBNBBalance] = useState(0);
    const [wallet, setWallet] = useState(false);
    const [reinvestBNB, setReinvestBNB] = useState(0);
    const [gatVolumn, setGatVolumn] = useState(2000000);
    const connect = async () => {
        if (window.web3) {
            if (window.ethereum) {
                await window.ethereum.enable();
                var accounts = await window.ethereum.send('eth_requestAccounts');
                if (window.ethereum.selectedAddress){
                    onAddressChange(window.ethereum.selectedAddress);
                    setWallet(window.ethereum.selectedAddress);
                    return true;
                }
            }
        }
        return false;
    }
    const isChecksumAddress = function (address) {
        // Check each case
        if (web3.utils)
            return web3.utils.isAddress(address);
    };
    const calcReinvest = (a, e) => {
        if (tokenPrice == 0) return a;
        for (var t = Number(a), r = 0; r < e; r++) t += t / 1000000000 * gatVolumn * 0.11 / tokenPrice;
        return Math.round(t);
    }
    const changeReinvestBNB = (e, value) => {
        if (value > bnbBalance - 0.03) setReinvestBNB(bnbBalance - 0.03);
        else setReinvestBNB(value);
    }
    const updateInfo = async (currentAddress) => {
        if(isChecksumAddress(currentAddress)){
            const data = await payday.methods.getAccountDividendsInfo(currentAddress).call();
            // 0: address
            // 1: index
            // 2: iterationsUntilProcessed
            // 3: withdrawableDividends
            // 4: totalDividends
            // 5: lastClaimTime
            // 6: nextClaimTime
            // 7: secondsUntilAutoClaimAvailable
            setBUSDPaid(parseFloat(web3.utils.fromWei(data[4])).toFixed(4));
            const secondsUntilAutoClaimAvailable = (parseInt(data[6]) - new Date().getTime() / 1000);
            if (secondsUntilAutoClaimAvailable > 0) {
                setNextPayoutLoading(`${Math.floor(secondsUntilAutoClaimAvailable / 60)}m`);
            }
            else {
                const numberOfDividendsHolders = await payday.methods.getNumberOfDividendTokenHolders().call();
                const percent = numberOfDividendsHolders > 0? (parseInt(numberOfDividendsHolders) - parseInt(data[2])) / parseInt(numberOfDividendsHolders): 0;
                setNextPayoutLoading(`${(percent * 100).toFixed(0)}%`);
            }
            setNextPayoutAmount(parseFloat(web3.utils.fromWei(data[3])).toFixed(4));
            
            const lastClaimTime = (new Date().getTime() / 1000 - parseInt(data[5]));
            if (lastClaimTime > 3600 * 100) {
                setLastPayoutTime('Never')
            }
            else if (lastClaimTime >= 3600) {
                const hours = (lastClaimTime / 3600).toFixed(0);
                setLastPayoutTime(`${hours} ${hours == 1? 'Hour' : 'Hours'} Ago`)
            }
            else if (lastClaimTime >= 60) {
                const minutes = (lastClaimTime / 60).toFixed(0);
                setLastPayoutTime(`${minutes} ${minutes == 1? 'Miinute' : 'Minutes'} Ago`);
            } else {
                const seconds = (lastClaimTime).toFixed(0);
                setLastPayoutTime(`${seconds} ${seconds == 1? 'Second' : 'Seconds'} Ago`);
            }
            const balance = await payday.methods.balanceOf(currentAddress).call();
            setPaydHoldings(Math.round(parseFloat(web3.utils.fromWei(balance))));
           
        }
        const tBUSDPaid = await payday.methods.getTotalDividendsDistributed().call();
        setTotalBUSDPaid(parseFloat(web3.utils.fromWei(tBUSDPaid)).toFixed(2));
        // setTotalUSDPaid(bnbPrice.toLocaleString('en-US'));
        if (infoTimer) {
            window.clearTimeout(infoTimer);
        }
        infoTimer = setTimeout(() => {
            updateInfo();
        }, 2000);

    }
    // '0x9b76D1B12Ff738c113200EB043350022EBf12Ff0,0xe9e7cea3dedca5984780bafc599bd69add087d56,0x55d398326f99059fF775485246999027B3197955';
    const updatePrice = () => {
        // pancakeswap.methods.getAmountsOut(10000, ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c','0x55d398326f99059fF775485246999027B3197955']).call()
        // .then((data) => {
        //     console.log(parseFloat(data[1])/10000);
        //     //setBnbPrice(parseFloat(data[1])/10000);
        // });
        pancakeswap.methods.getAmountsOut(1000000000, [payday._address,'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c']).call()
        .then((data) => {
            setTokenPrice(parseFloat(data[1]) *  1000000000);
        }).catch((err) => {
            console.log('can not get token price');
        });
        
        // priceFeed.methods.latestRoundData().call()
        // .then((roundData) => {
        //     if (web3.utils){
        //         setBnbPrice(parseFloat(web3.utils.fromWei(roundData[1], 'gwei') * 10));
        //     }
                
        // });
        if (priceTImer) {
            window.clearTimeout(priceTImer);
        }
        priceTImer = setTimeout(() => {
            updatePrice();
        }, 10000);
    };
    const claimPayout = async () => {
        if((await connect()) == true) {
            if (paydTx) {
                var data = await paydTx.methods.claim();
                web3.eth.getTransactionCount(web3.currentProvider.selectedAddress).then((function(t) {
                    console.log(t);
                    var a = {
                        chainId: 56,
                        nonce: web3.utils.toHex(t),
                        gasPrice: web3.utils.toHex(7000000000),
                        gasLimit: web3.utils.toHex(250000),
                        from: web3.currentProvider.selectedAddress,
                        to: payday.address,
                        value: web3.utils.toHex(web3.utils.toWei("0")),
                        data: data.encodeABI()
                    };
                    web3.eth.sendTransaction(a).then((function(e) {
                        setClaimed(true);
                    }
                    ))
                }
                ))
            } else {

            }
        }
    };
    // const connectAndReinvest = async () => {
    //     if((await connect()) == true) {
    //         if (greenArrow && tokenPrice != 0) {
    //             const e = Number(reinvestBNB) * bnbPrice / tokenPrice * 0.93;
    //             var data = await pancakeswap.methods.swapETHForExactTokens(web3.utils.toHex(web3.utils.toWei(e.toFixed(0))), ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', greenArrow._address], web3.currentProvider.selectedAddress , Date.now() + 300000);
    //             web3.eth.getTransactionCount(web3.currentProvider.selectedAddress).then((function(t) {
    //                 var a = {
    //                     chainId: 56,
    //                     nonce: web3.utils.toHex(t),
    //                     gasPrice: web3.utils.toHex(5000000000),
    //                     gasLimit: web3.utils.toHex(2000000),
    //                     from: web3.currentProvider.selectedAddress,
    //                     to: greenArrow.address,
    //                     value: web3.utils.toHex(web3.utils.toWei(reinvestBNB.toString())),
    //                     data: data.encodeABI()
    //                 };
    //                 web3.eth.sendTransaction(a).then((function(e) {
    //                     setPaid(true);
    //                 }
    //                 ))
    //             }
    //             ))
    //         } else {

    //         }
    //     }
    // }
    useEffect(() => {
        if(isChecksumAddress(currentAddress)){
            if (infoTimer) {
                window.clearTimeout(infoTimer);
            }
            infoTimer = setTimeout(() => {
                updateInfo(currentAddress);
            }, 1000);
            web3.eth.getBalance(currentAddress).then((balance) => {
                setBNBBalance(parseFloat(web3.utils.fromWei(balance)));
                // setReinvestBNB(parseFloat(web3.utils.fromWei(balance)) > 0.03? ((parseFloat(web3.utils.fromWei(balance)) - 0.03) / 2).toFixed(4) : "0");
            });
        }
       
    }, [currentAddress]);
    
    useEffect(() => {
        
        connect().then(()=> {
            updateInfo(window.ethereum?.selectedAddress);
            updatePrice();
        }).catch(err => {
            updateInfo(window.ethereum?.selectedAddress);
            updatePrice();
        })
    }, []);
    return (
        <main className="py-4">
            <div className="container-lg p-3">
                <div className="row">
                    <div className="col-12">
                        <h3 className={toggleDefault? 'text-white': 'text-black'}>
                            PAYD Earnings Manager
                        </h3>
                    </div>
                    {isChecksumAddress(currentAddress) && 
                    <div className="col-12 mt-3">
                        <div className="d-flex rounded-3 text-white bg_cyan justify-content-between align-items-center p-3 flex-wrap">
                        {paydHoldings < 10000 &&
                            <span style={{overflow:'auto'}}>{currentAddress} | BNB In Your Wallet: {bnbBalance.toFixed(4)} - YOU NEED TO HOLD MORE THAN 1000K PAYD TO RECEIVE DIVIDENS</span>
                        }
                        {paydHoldings > 10000 && <span style={{overflow:'auto'}}>
                            {currentAddress} | BNB In Your Wallet: {bnbBalance.toFixed(4)} 
                            </span>}
                        
                            <a href={"https://exchange.pancakeswap.finance/#/swap?outputCurrency=" + payday._address} className="text-white">
                                Buy PAYD →
                            </a>
                        </div>
                    </div>
                    }
                   
                </div>
                <div className="row mt-5">
                    <div className="mb-3 col-6 col-xl-3  h-auto">
                        <div className={`col_wrapper rounded-3 h-100 shadow-sm d-flex flex-column flex-md-row  align-items-center p-3  ${toggleDefault? 'bg_dark_prime': 'bg-white'}`}>
                            <span className="gat_size text-white mb-2 mb-md-0 d-flex justify-content-center align-items-center">
                                <i className="fas fa-database    "></i>
                            </span>
                            <div className="ms-md-3 ">
                                <span className={`${toggleDefault?'text-white-50': 'text-black-50'}`}>Your PAYD Holdings</span>
                                <h5 className={`mb-0 ${toggleDefault?'text-white': 'text-black'} mt-2`}>
                                    {Math.round(paydHoldings).toLocaleString('en-US')} PAYD
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3 col-6 col-xl-3  h-auto ">
                        <div className={`col_wrapper rounded-3 h-100 shadow-sm d-flex flex-column flex-md-row align-items-center p-3  ${toggleDefault? 'bg_dark_prime': 'bg-white'}`}>
                            <span className="gat_size bg_cyan  mb-2 mb-md-0 text-white d-flex justify-content-center align-items-center">
                                <i className="fas fa-dollar-sign    "></i>
                            </span>

                            <div className="ms-3 ">
                                <span className={`${toggleDefault?'text-white-50': 'text-black-50'}`}>Total BUSD Paid<br/>By Holding PAYD</span>
                                <h5 className="mb-0 mt-2 text_yellow">
                                    {busdPaid} BUSD
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 col-6 col-xl-3  h-auto">
                        <div className={`col_wrapper rounded-3 h-100 d-flex flex-column flex-md-row align-items-center p-3 shadow-sm ${toggleDefault? 'bg_dark_prime': 'bg-white'}`}>
                            <span className="gat_size bg_primary  mb-2 mb-md-0 text-white d-flex justify-content-center align-items-center">
                                <i className="fas fa-lock    "></i>
                            </span>

                            <div className="ms-3 ">
                                <span className={`${toggleDefault? 'text-white-50': 'text-black-50'}`}>Last Payout Time</span>
                                <h5 className={`mb-0 mt-2 ${toggleDefault? 'text-white': 'text-black'}`}>
                                    {lastPayoutTime}
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 col-6 col-xl-3  h-auto">
                        <div className={`col_wrapper rounded-3 h-100 flex-column flex-md-row d-flex align-items-center p-3 shadow-sm  ${toggleDefault? 'bg_dark_prime': 'bg-white'}`}>
                            <span className="gat_size bg_yellow  mb-2 mb-md-0 text-white d-flex justify-content-center align-items-center">
                                <i className="fas fa-history    "></i>
                            </span>

                            <div className="ms-3 ">
                                <span className={`${toggleDefault? 'text-white-50': 'text-black-50'}`}>Next Payout Loading</span>
                                <h5 className={`${toggleDefault? 'mb-0 mt-2 text-white': 'mb-0 mt-2 text-black'}`}>
                                    <span className="text_yellow">
                                        {nextPayoutAmount == 0? 'Processing': nextPayoutAmount}
                                    </span>
                                    &nbsp;  | {nextPayoutLoading}
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-12">
                        <div className={`col_wrapper shadow-sm ${toggleDefault? 'bg_dark_prime': 'bg-white'} p-3`}>
                            <div className="row">
                                <div className="col-12 h-auto">
                                    <div className="col_wrapper h-100">
                                        {nextPayoutAmount == 0 && <button className="btn h-100 disable_btn text_sm text-capitalize w-100 bg_prime text-black">
                                            Payout Is Processing
                                        </button>
                                        }
                                        {nextPayoutAmount != 0 && wallet && claimed && <button className="btn h-100 text_sm text-capitalize w-100 bg_prime text-black" >
                                            Payout Claimed!
                                        </button>}
                                        {nextPayoutAmount != 0 && wallet && !claimed && <button className="btn h-100 text_sm text-capitalize w-100 bg_prime text-black" onClick={() => claimPayout()}>
                                            Claim Payout
                                        </button>}
                                        {nextPayoutAmount != 0 && !wallet && <button className="btn h-100 text_sm text-capitalize w-100 bg_prime text-black" onClick={() => claimPayout()}>
                                            Optional - Connect Wallet And Claim Manually NOW
                                        </button>
                                        }
                                        
                                    </div>
                                </div>
                                {/* <div className="col-6 h-auto">
                                    <div className="col_wrapper h-100">
                                        {paydHoldings == 0 && <button className="btn disable_btn h-100 text_sm text-capitalize w-100 bg_cyan text-white">
                                            You Do Not Own Enough GAT To Reinvest
                                        </button>}
                                        {paydHoldings != 0 && wallet && paid && <button className="btn disable_btn h-100 text_sm text-capitalize w-100 bg_cyan text-white" >
                                            Reinvested {reinvestBNB} BNB at Only 5% Buy Tas!
                                        </button>}
                                        {paydHoldings != 0 && wallet && !paid && <button className="btn h-100 text_sm text-capitalize w-100 bg_cyan text-white" onClick={() => connectAndReinvest()} >
                                            Reinvest <input type="text" className="text-center" value={reinvestBNB} onClick={(e) => {e.stopPropagation(); return false;}} onChange={(e) => changeReinvestBNB(e, e.target.value)}/> BNB (click here to confirm)
                                        </button>}
                                        {paydHoldings != 0 && !wallet && <button className="btn h-100 text_sm text-capitalize w-100 bg_cyan text-white" onClick={() => connectAndReinvest()}>
                                            Connect and Reinvest With ONLY 5% Buy Tax!
                                        </button>}
                                        
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="row mt-5">
                    <div className="col-12">
                        <div className={`col_wrapper ${toggleDefault? 'bg_dark_prime': 'bg-white'} shadow-sm p-3 d-flex flex-column text-center align-items-center`}>

                            <img style={{ height: '150px' }} src={img1} alt="" />
                            <h4 className="text-white mt-4 font_size_4">
                                Total BUSD Paid To PAYD Holders
                            </h4>
                            <div className="font_size_5">
                                <span className="text_cyan">
                                    {totalBUSDPaid.toLocaleString('en-US')} <span className="text_yellow">BUSD</span>
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="row">
                            <div className="col-md-12 h-auto">
                                <div className={`col_wrapper shadow-sm ${toggleDefault? 'bg_dark_prime': 'bg-white'} p-4 h-100`}>
                                    <ul className="list-group">
                                        <li className="list-group-item bg_transparent text-center border-0">
                                            <img style={{ height: '100px' }} src={img2} alt="" />
                                        </li>
                                        <li className={`list-group-item bg_transparent text-center border-0 ${toggleDefault?'text-white': 'text-black'}`}>
                                            <h3>
                                                Your {paydHoldings.toLocaleString('en-US')} PAYD Earns:
                                            </h3>
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                                {(paydHoldings / 1000000000 * 220000).toFixed(2)} BUSD </span>
                                            <span className="text_cyan me-2">
                                                (${(paydHoldings / 1000000000 * 220000).toFixed(2)})
                                            </span>
                                            Per Day
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                            {(paydHoldings / 1000000000 * 220000 * 7).toFixed(2)} BUSD </span>
                                            <span className="text_cyan me-2">
                                            (${(paydHoldings / 1000000000 * 220000 * 7).toFixed(2)})
                                            </span>
                                            Per Week
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                                {(paydHoldings / 1000000000 * 220000 * 30).toFixed(2)} BUSD </span>
                                            <span className="text_cyan me-2">
                                            (${(paydHoldings / 1000000000 * 220000 * 30).toFixed(2)})
                                            </span>
                                            Per Month
                                        </li>

                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                            {(paydHoldings / 1000000000 * 220000 * 365).toFixed(2)} BUSD </span>
                                            <span className="text_cyan me-2">
                                            (${(paydHoldings / 1000000000 * 220000 * 365).toFixed(2)})
                                            </span>
                                            Per Year
                                        </li>
                                        <div className="list-group-item text-white-50 bg_transparent text-center border-0 text_lg">
                                            Estimations are based on $2m trading volume
                                        </div>
                                    </ul>
                                </div>
                            </div>
                            {/* <div className="col-md-6 h-auto">
                                <div className={`col_wrapper shadow-sm ${toggleDefault? 'bg_dark_prime': 'bg-white'} p-4 h-100`}>
                                    <ul className="list-group">
                                        <li className="list-group-item bg_transparent text-center border-0">
                                            <img style={{ height: '100px' }} src={img2} alt="" />
                                        </li>
                                        <li className={`list-group-item bg_transparent text-center border-0 ${toggleDefault?'text-white': 'text-black'}`}>
                                            <h3>
                                                By Reinvesting Dividends Every Day, Your {paydHoldings.toLocaleString('en-US')} PAYD Becomes:
                                            </h3>
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                                {calcReinvest(paydHoldings, 7).toLocaleString('en-US')} PAYD </span>
                                            <span className="text_cyan me-2">
                                                ({paydHoldings > 0? (calcReinvest(paydHoldings, 7) / paydHoldings).toFixed(2) : 0 }x Earnings)
                                            </span>
                                            In a Week
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                            {calcReinvest(paydHoldings, 30).toLocaleString('en-US')} PAYD </span>
                                            <span className="text_cyan me-2">
                                                ({paydHoldings > 0? (calcReinvest(paydHoldings, 30) / paydHoldings).toFixed(2) : 0 }x Earnings)
                                            </span>
                                            In a Month
                                        </li>
                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                            {calcReinvest(paydHoldings, 60).toLocaleString('en-US')} PAYD </span>
                                            <span className="text_cyan me-2">
                                            ({paydHoldings > 0? (calcReinvest(paydHoldings, 60) / paydHoldings).toFixed(2) : 0 }x Earnings)
                                            </span>
                                            In 2 Months

                                        </li>

                                        <li className={`list-group-item text_sm ${toggleDefault?'text-white-50': 'text-black-50'} bg_transparent text-center border-0`}>
                                            <span className="text_yellow">
                                            {calcReinvest(paydHoldings, 180).toLocaleString('en-US')} PAYD </span>
                                            <span className="text_cyan me-2">
                                            ({paydHoldings > 0? (calcReinvest(paydHoldings, 180) / paydHoldings).toFixed(2) : 0 }x Earnings)
                                            </span>
                                            In 6 Months
                                        </li>
                                        <div className="list-group-item text_lg text-white-50 bg_transparent text-center border-0">
                                            Estimations are based on current PAYD price
                                        </div>
                                    </ul>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}

export default Main;