import React from 'react';
import './Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBg } from '../../redux/reducer';
import { useEffect } from 'react';
import { useState } from 'react';
import logo from '../../images/logo.png';
function Header(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleDefault = useSelector(state => state.toggle.value)
    const dispatch = useDispatch();
    useEffect(() => {
        return toggleDefault ? document.body.classList.remove('bg-white') : document.body.classList.add('bg-white')
    })
    const {currentAddress, onAddressChange} = props;

    return (
        <header>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="col_wrapper py-3">
                            <div className="row">
                                <div className="col-4">
                                    <menu className={`m-0 p-0 shadow ${toggleDefault ? 'bg_dark_prime' : 'bg-white'} ${menuOpen? 'stop_translate' : ''}`}>
                                        <div className="d-flex px-2 py-3 align-items-center">
                                            <img style={{ height: '30px', marginLeft: '20px' }} src={logo} alt="" />
                                            
                                        </div>
                                        <ul className="list-group">
                                            <li className="list-group-item border-0 bg_transparent">
                                                <a href="#" className={`${toggleDefault ? 'text-white' : 'text-black'}`}>
                                                    <i className="fas fa-home me-3    "></i>
                                                    PAYD Earnings
                                                </a>
                                            </li>
                                            {/* <li className="list-group-item border-0 bg_transparent">
                                                <a href="#" className={`${toggleDefault ? 'text-white' : 'text-black'}`}>
                                                    <i className="fas fa-rocket me-3    "></i>
                                                    Booster App (Soon!)
                                                </a>
                                            </li>
                                            <li className="list-group-item border-0 bg_transparent">
                                                <a href="https://greenarrowtoken.tech/lottery" className={`${toggleDefault ? 'text-white' : 'text-black'}`} target="_blank">
                                                    <i className="fas fa-ticket-alt me-3    "></i>
                                                    $GAT LOTTERY
                                                </a>
                                            </li> */}
                                        </ul>
                                    </menu>
                                    <nav className={`m-0 p-3 shadow-sm ${toggleDefault ? 'bg_dark_prime' : 'bg-white'}`}>
                                        <div className="container-lg">
                                            <div className="row">
                                                <div className="col-9 col-md-8">
                                                    <div className="col_wrapper">

                                                        <div className="d-flex align-items-center ">
                                                            <button onClick={()=> setMenuOpen(!menuOpen)} className={`btn btn-muted d-lg-none shadow-sm ${toggleDefault? 'text-white': 'text-black'}`}>
                                                                <i className="fas text_lg fa-bars "></i>
                                                            </button>
                                                            <form action="" className="w-100">
                                                                <div className="form-group d-flex justify-content-center">
                                                                    <input className={`${toggleDefault ? 'text-white' : 'text-black'} form-control w-75 ${toggleDefault ? 'bg_24 shadow-0' : 'bg-white shadow-sm'} border-0 outline-0`} type="text" placeholder="Paste your address here" onChange={(e) => onAddressChange(e.target.value)} value={currentAddress}/>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-3 col-md-4">
                                                    <div className="col_wrapper">
                                                        <div className="d-flex justify-content-end align-items-center">
                                                            {/* <a className="btn" href="https://greenarrowtoken.tech/login" style={{backgroundColor: '#14f1d9'}}>Login</a> */}
                                                            <button onClick={() => dispatch(toggleBg(!toggleDefault))} className={`btn btn-muted shadow-sm ${toggleDefault ? 'text-white' : 'text-black'}`}>
                                                                {toggleDefault ?
                                                                    <i className="fas fa-sun text_sm"></i>
                                                                    :
                                                                    <i className="fas fa-moon   text_sm "></i>
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </nav>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </header>
    );
}

export default Header;