
import React from 'react';

import {useState , useEffect, useRef, useContext} from 'react' ;

import web3 from '../../../connection/web3';
import Web3Context from '../../../store/web3-context';

import { connect } from 'react-redux';

import { useWeb3React } from '@web3-react/core';

import PropTypes from 'prop-types' ;

import { getItem, setItem } from '../../../utils/helper';

import { GetTokenStakeInfoList } from '../../../redux/actions/stake';

import {
    Card ,
    CardContent ,
    CardHeader ,
    Divider ,
    Grid, 
    useMediaQuery,
    Box
} from '@mui/material' ;

import { makeStyles } from '@mui/styles';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';

import StakingInfoList from './StakingInfoList';
import wallet from '../../../redux/reducers/wallet';

const useStyles = makeStyles((theme) => ({
    root : {
        marginTop : theme.spacing(8) ,
        boxShadow: "3px -4px 7px 0px lightblue !important",
        border : "1px solid lightblue" ,
        marginLeft :  "7% !important" ,
        marginRight : "7% !important" ,
        "& .MuiCardContent-root" : {
            padding : "0px" ,
            marginTop : "24px" ,
            [theme.breakpoints.down('sm')] : {
                marginTop : '60px'
            }
        },
        "& .MuiCardHeader-title" : {
            fontSize : "14px !important" ,
            color : "#232E3C" ,
            width : "100px",
            height : "36px !important" ,
            display : "flex" ,
            alignItems : "center" ,
            paddingLeft : theme.spacing(2),
            borderBottom : "1px solid #206bc4"
        } ,
        "& .MuiCardHeader-action" : {
            fontSize : "14px !important" ,
            color : "#232E3C" ,
            margin : "0px" ,
            [theme.breakpoints.down('sm')] : {
                width : '90%',
                margin : 'auto',
                marginTop : '10px',
            }
        } ,
        "& .MuiCardHeader-root" : {
            padding : "0px !important" ,
            height : "36px",
            [theme.breakpoints.down('sm')] : {
                display : 'block',
            }
        },
        "& input" : {
        }
    } ,
    tableContainer : {
        marginTop : theme.spacing(3) ,
    },
    tableHeader : {
        backgroundColor : theme.palette.primary.main ,
        "& th" : {
            color : "white !important",
            fontWeight : "bold !important" ,
            textAlign : "center"
        }
    } ,
    tableBody : {
        "& td,th" : {
            textAlign : "center"
        }
    },
    btnGroup : {
        textAlign : "center" ,
        "& button" : {
            paddingLeft : "25px !important" ,
            paddingRight : "25px !important" ,
            fontWeight : "bold"
        },
        "& .btn-outline-warning" : {
            borderRadius : "10rem"
        },
        "& .btn-outline-warning:hover" : {
            color : "white"
        },
        "& .btn-warning" : {
            borderRadius : "10rem" ,
            color : "white"
        },
        "& .btn-warning:hover" : {
            color : "white"
        }
    }
}));

let tokenStakeInfoTimer ;

const StakingTable = (props) => {

    const { tokenStakeInfoList , GetTokenStakeInfoList, walletAddress } = props ;
    const web3Ctx = useContext(Web3Context);
    const classes = useStyles() ;

    const isXs = useMediaQuery("(min-width : 990px)") ;

    // const { active, account , library , activate , deactivate } = useWeb3React() ;
    const [coinType , setCoinType] = useState(1) ;
    const searchCtrl = useRef(null) ;

    const setTimerForTokenStakeList =  async (searchStr) => {
        clearInterval(tokenStakeInfoTimer) ;

        tokenStakeInfoTimer = setInterval(async () => {
            if( Number( getItem('pageIndex') ) !== 4 ){

                clearInterval(tokenStakeInfoTimer) ;
                return ;
            }
            await GetTokenStakeInfoList(walletAddress ,"get" , searchStr) ; 
            return ;
        } , 15000 )
    }

    const searchForMoreTokens = async (token_symbol) => {
        setTimerForTokenStakeList() ;
        await GetTokenStakeInfoList(walletAddress ,"get" , token_symbol) ; 

        await setTimerForTokenStakeList(token_symbol) ;
    }

    useEffect(() => {
        if(!getItem('pageIndex')){
            setItem('pageIndex' , '4') ;
            return ;
        }
        if(walletAddress){
            GetTokenStakeInfoList(walletAddress ,"get" , "") ;

            setTimerForTokenStakeList("") ;

        } else {
            return ;
        }
    } , [getItem('pageIndex') , walletAddress]);

    useEffect(() => {
        if(!searchCtrl) {
            searchCtrl.current.value = "" ;
        }
    } ,  [coinType]) ;
    return (
        <Card className={classes.root}>
            <CardHeader
                title = "Guaranteed"
                action = {
                    <Box className='input-group'>
                        <Box className='input-group-prepend'>
                            <Box component={"span"} className='input-group-text'>
                                <SearchIcon />
                            </Box>
                        </Box>
                        <Box component={"input"} type="text" className="form-control" placeholder='Search for more tokens.' onChange={(e) => searchForMoreTokens(e.target.value)} />
                    </Box>
                }
            >
            </CardHeader>
            <Divider />
            <CardContent>
                <Grid container spacing={2} className={classes.btnGroup}>
                    <Grid item xs={12} sm={isXs ? 3 : 12}>
                        <Box component={"button"} className={coinType === 1 ? 'btn btn-warning' : 'btn btn-outline-warning'} onClick={() => setCoinType(1)}>
                            <AutoAwesomeOutlinedIcon />
                            &nbsp;&nbsp;Popular Coins
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={isXs ? 3 : 12}>
                        <button className={coinType === 2 ? 'btn btn-warning' : 'btn btn-outline-warning'} onClick={() => setCoinType(2)} >Best for Beginners</button>
                    </Grid>
                    <Grid item xs={12} sm={isXs ? 3 : 12}>
                        <button className={coinType === 3 ? 'btn btn-warning' : 'btn btn-outline-warning'} onClick={() => setCoinType(3)}>
                            <AddCardOutlinedIcon />
                            &nbsp;&nbsp;New Listing
                        </button>
                    </Grid>
                </Grid>
                <StakingInfoList 
                    tokenStakeInfoList={tokenStakeInfoList}
                    GetTokenStakeInfoList={GetTokenStakeInfoList}
                    coinType={coinType}
                />
            </CardContent>
        </Card>
       
    );
}

StakingTable.propsType = {
    tokenStakeInfoList : PropTypes.array.isRequired 
}

const mapStateToProps = (state) => ({
    tokenStakeInfoList : state.stake.tokenStakeInfoList,
    walletAddress : state.wallet.walletAddress
})

const mapDispatchToProps = {
    GetTokenStakeInfoList
}

export default connect(mapStateToProps , mapDispatchToProps)(StakingTable) ;