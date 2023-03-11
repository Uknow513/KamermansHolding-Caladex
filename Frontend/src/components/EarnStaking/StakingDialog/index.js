
import React from 'react' ;

import { useEffect, useMemo, useState, useContext } from 'react';

import web3 from '../../../connection/web3';
import Web3Context from '../../../store/web3-context';

import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';

import { connect } from 'react-redux' ;

import { PRIVATE_CALADEX_API } from '../../../static/constants' ;

import swal from 'sweetalert' ;

import CheckButton from './CheckButton';

import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector ,
    TimelineContent,
    TimelineDot
} from '@mui/lab' ;

import {
    Dialog ,
    DialogTitle,
    DialogContent ,
    Modal ,
    Box ,
    TextField ,
    Grid,
    Divider ,
    Collapse ,
    Button ,
    InputAdornment ,
    Checkbox
} from '@mui/material' ;

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess' ;
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';

import { makeStyles } from '@mui/styles';
import { getItem  , formatDBDate} from '../../../utils/helper';

import { AddTokenStakeLog, GetStakeDateTime , RemoveTokenStakeLog} from '../../../redux/actions/stake';
import { GetTokenBalanceInfo } from '../../../redux/actions/token';

const useStyles = makeStyles(() => ({
    stakingDialog : {
        "& span" :{
            color : "#848c93" ,
            fontFamily : "BinancePlex, Arial, sans-serif !important" ,
        } ,
        "& .MuiDialogTitle-root" :{
             textAlign : "center"
         },
         "& .MuiDialogContent-root" : {
             '&::-webkit-scrollbar': {
                 width: '0.7em',
             },
             '&::-webkit-scrollbar-track': {
                 '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
             },
             '&::-webkit-scrollbar-thumb': {
                 backgroundColor: 'lightgray',
                 borderRadius : "5px"
             }
         },
        "& .MuiTimelineItem-root::before" : {
            left : "0px !important" ,
            flex: "none",
            padding:"0px !important" ,
        } ,
        "& .MuiTimelineItem-root" : {
             minHeight : "0px !important"
         } ,
        "& .MuiButton-root" : {
            color : "black" ,
            fontWeight : "bold" ,
            border : "2px solid #c98f06" ,
            textTransform : "capitalize" ,
            minWidth : "90px" ,
            "&:hover" : {
                backgroundColor : "#fef6d8" ,
                border : "2px solid #e1c226" ,
            },
            "&.Mui-expanded" : {
                 backgroundColor : "#fef6d8"
            }
         } ,
         "& .MuiTimelineContent-root" : {
             paddingTop : "0px !important" ,
             marginTop : "0px !important" ,
             height : "45px !important" ,
             fontSize : "14px !important" ,
         } , 
         "& .MuiTimelineDot-root" : {
             margin : "0px !important" ,
             backgroundColor : "#f9b40f" ,
         } ,
         "& .MuiTimelineConnector-root" : {
             backgroundColor : "#54cf9d" ,
             flex : "none" ,
             height : "calc( 100% - 10px)" ,
         },
         "& .MuiTimelineSeparator-root" : {
             width : "30px !important" ,
             display : "flex !important" ,
             flexDirection : "column !important" ,
             justifyContent : "space-between !important" ,
         }
    } ,
    subTitle : {
        marginTop : "15px !important" ,
        fontSize : "14px" ,
        fontWeight : 545
    },
    btnGroup : {
        display : "flex" ,
        justifyContent : "space-around" ,
        marginTop : "10px !important"
    } ,
    item : {
        marginTop : "10px !important" ,
        fontSize : "14px"
    } ,
    dateTime : {
        textAlign : "center !important"
    } ,
    noneDot : {
       marginLeft : "5px !important" ,
       marginRight : "5px !important" ,
       height : "100% !important"
    } ,
    collapse : {
        marginTop : "30px !important"
    },
    stakeBtn : {
        backgroundColor : "#c98f06 !important" ,
        border : "0px !important" ,
        width : "130px" ,
        fontSize : "15px !important" ,
        color : "white !important" ,
        textTransform : "uppercase !important" ,
        boxShadow : "(0px 1px 1px 0px)"
    } 
}));

let tokenStakeInfoTimer ;

const StakingDialog = (props) => {

    const { open , handleClose , logo_url ,symbol ,  token_id , balance , est_apy , stake_id , current_token , isStaking ,
        stake_date , onUnStake , estUSDAmount , estTokenAmount ,
        updateLoadingStakeArray , walletAddress,
        GetTokenStakeInfoList , AddTokenStakeLog, whichButton ,
        tokenInfo ,
        GetTokenBalanceInfo } = props ;

    const web3Ctx = useContext(Web3Context);

    const [isVisibleSummary , setVisibleSummary] = useState(false) ;
    const [endDate , setEndDate] = useState() ;
    const [duration , setDuration] = useState(365) ;
    const [inputAmount , setInputAmount] = useState('') ;
    const [isAgree , setIsAgree] = useState(false) ;

    // const { active , account } = useWeb3React() ;

    const handleSummary = () => {
        setVisibleSummary(!isVisibleSummary) ;
    } ;

    const classes = useStyles() ;

    useEffect(() => {
        let stakeDate = stake_date ;

        stakeDate = stakeDate.split(',') ;

        let ymd = stakeDate[0].split('/') ;

        ymd = ymd[2] + "-" + ymd[1] + "-" + ymd[0] ;

        let endDate = new Date( new Date(ymd + stakeDate[1]).getTime() + 24 * 60 * 60 * 1000 * Number(duration) );

        endDate = endDate.toLocaleString('en-GB') ;

        setEndDate(endDate) ;

    } , [duration]) ;

    const emitUnStake = async () => {

        handleClose() ;

        // console.log(tokenInfo) ;
        await onUnStake(  walletAddress , current_token.stakelog_id , token_id ,  tokenInfo) ;
    }
    const emitStakeEvent  = async () => {
        if(inputAmount === "") {
            return swal({
                title: "WARNING",
                text: "Not allowed empty value.",
                icon: "warning",
                timer: 2000,
                button: false
            }) ;
        }
        if(isNaN( Number(inputAmount) )) {
            return swal({
                title: "WARNING",
                text: "Invalid amount type.",
                icon: "warning",
                timer: 2000,
                button: false
            }) ;
       }

       if( Number(inputAmount) > Number(balance)) {
            return swal({
                title: "WARNING",
                text: "Insufficient tokens.",
                icon: "warning",
                timer: 2000,
                button: false
            }) ;
        }
        
       if(Number(inputAmount) < Number(current_token.minimum)){
            return swal({
                title: "WARNING",
                text: "Underprice amount.",
                icon: "warning",
                timer: 2000,
                button: false
            }) ;
       }
       
       if(Number(inputAmount) > Number(current_token.maximum)) {
            return swal({
                title: "WARNING",
                text: "Overflow amount.",
                icon: "warning",
                timer: 2000,
                button: false
            }) ;
       }
        if(walletAddress){

            await updateLoadingStakeArray(token_id , false) ;

            await handleClose() ;

            let result = await AddTokenStakeLog(walletAddress , stake_id , inputAmount , duration ) ;

            await updateLoadingStakeArray(token_id , true) ;

            await GetTokenStakeInfoList(walletAddress , "get" , "") ;

            if(result === "Ok") {
                swal({
                    title: "Success",
                    text: "Stake successfully.",
                    icon: "success",
                    timer: 2000,
                    button: false
                }) ;
            } else {
                swal({
                    title : "Error" ,
                    text : "Stake Failed" ,
                    icon : "error" ,
                    timer : 2000 ,
                    button : false 
                })
            }

            await GetTokenBalanceInfo(walletAddress , "") ;

            return ;
        }
    }

    return (
        <div className={classes.root}>
            <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    className={classes.stakingDialog}
            >
                <DialogTitle>{ isStaking ? (whichButton !== 2 ? "Staking" : "Stake Info") : "Stake" } </DialogTitle>
                 <DialogContent>
                    <Grid container>
                        <Grid item xs={12} className={classes.subTitle}>
                            {
                                whichButton !== 2 ? "Duration" : "" 
                            }
                        </Grid>
                        {
                            whichButton !== 2 ? <Grid item xs={12} className={classes.btnGroup}>
                                <Button variant='outlined' onClick={() => setDuration(30)}>
                                    30 Days
                                    <CheckButton 
                                        right={"0px"} 
                                        top={"0px"} 
                                        width={"20px"} 
                                        height={"20px"}
                                        color={"#c98f06"}
                                        borderRadius={"0px"}
                                        visible={!isStaking ? duration === 30 : current_token.duration === 30}
                                    />
                                </Button>
                                <Button variant='outlined' onClick={() => setDuration(60)}>
                                    60 Days
                                    <CheckButton 
                                        right={"0px"} 
                                        top={"0px"} 
                                        width={"20px"} 
                                        height={"20px"}
                                        color={"#c98f06"}
                                        borderRadius={"0px"}
                                        visible={!isStaking ? duration === 60 : current_token.duration === 60}
                                    />
                                </Button>
                                <Button variant='outlined' onClick={() => setDuration(365)}>
                                    1 Year
                                    <CheckButton 
                                        right={"0px"} 
                                        top={"0px"} 
                                        width={"20px"} 
                                        height={"20px"}
                                        color={"#c98f06"}
                                        borderRadius={"0px"}
                                        visible={!isStaking ? duration === 365 : current_token.duration === 365}
                                    />
                                </Button>
                            </Grid> : <>
                            </>
                        }
                        
                        <Grid item xs={12} className={classes.subTitle}>
                            {
                                !isStaking ? "Lock Amount Limitation" : ( (whichButton !== 2) ? "Staking Amount" : "Staked Amount" )
                            }
                            
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="input-with-icon-textfield"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <img src={`${PRIVATE_CALADEX_API}files/${logo_url}`} width={30} height={25}/>
                                            &nbsp;<Box component="span" style={{fontWeight:"bold"}}>{symbol}</Box> 
                                            &nbsp;&nbsp;&nbsp;<Box component="span" style={{fontWeight:"bold" , color : "#f76707"}}>Max</Box>
                                        </InputAdornment>
                                    ),
                                    readOnly : !isStaking ? false : true
                                }}
                                variant="standard"
                                placeholder={Number(!isStaking ? balance : current_token.amount).toString()}
                                fullWidth
                                onChange={(e) => setInputAmount(e.target.value) }
                            />
                        </Grid>
                        {
                            !isStaking ?  <>
                                <Grid item xs={12} className={classes.item}>
                                    <Box component={"span"}>
                                        Available : 
                                    </Box>
                                    {balance} {symbol}
                                </Grid>
                            </> : <>
                            </>
                        }
                        
                        {
                            !isStaking ? <>
                                <Grid item xs={12} className={classes.subTitle}>
                                        Amount Limit
                                </Grid>
                                <Grid item xs={12} className={classes.item}>
                                    <Box component={"span"}>
                                        Minimum : 
                                    </Box>
                                    { current_token ? current_token.minimum : ""} {symbol}
                                </Grid>
                                <Grid item xs={12} className={classes.item}>
                                    <Box component={"span"}>
                                        Maximum :
                                    </Box>
                                    { current_token ? current_token.maximum : ""} {symbol}
                                </Grid>
                            </> : <>
                            </>
                        }
                        <Divider />
                        <Grid item xs={12} className={classes.subTitle}>
                            <Grid item xs={12} onClick={handleSummary} style={{display : "flex" , justifyContent:"space-between"}}>
                                <div>Summary</div>
                                {
                                    !isStaking ? ( isVisibleSummary  ? <div style={{cursor : "pointer"}}>show less<ExpandLessIcon /></div> : <div style={{cursor : "pointer"}}>show more<ExpandMoreIcon /></div>  )
                                    : <>
                                    </>
                                }
                            </Grid>
                            <Collapse in={ !isStaking ? isVisibleSummary : true } timeout="auto" unmountOnExit>
                                <Grid item xs={12} className={classes.collapse}>
                                    <Timeline>
                                        <TimelineItem >
                                            <TimelineSeparator>
                                                <TimelineDot />
                                                <TimelineConnector />
                                            </TimelineSeparator>
                                            <TimelineContent>
                                                <Grid container >
                                                    <Grid item xs={5}>
                                                        <Box component={"span"}>
                                                            Stake Date
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={7} className={classes.dateTime}>
                                                        {
                                                            !isStaking ? stake_date : formatDBDate(current_token.begin_date)
                                                        }
                                                    </Grid>
                                                </Grid>
                                            </TimelineContent>
                                        </TimelineItem>
                                        <TimelineItem >
                                            <TimelineSeparator>
                                                <TimelineDot />
                                                {/* <TimelineConnector /> */}
                                            </TimelineSeparator>
                                            <TimelineContent >
                                                <Grid container >
                                                    <Grid item xs={5}>
                                                        <Box component={"span"}>
                                                            End Date
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={7} className={classes.dateTime}>
                                                        {
                                                            !isStaking ? endDate : formatDBDate(current_token.finish_date)
                                                        }
                                                        {
                                                            whichButton === 2 ? " (" + Math.floor( ( new Date(formatDBDate(current_token.finish_date)).getTime() - new Date().getTime() ) / 1000 / 24 / 60 / 60) + "days remaining)" : <></>
                                                        }
                                                    </Grid>
                                                </Grid>
                                            </TimelineContent>
                                        </TimelineItem>
                                        
                                    </Timeline>
                                </Grid>
                               
                            </Collapse>
                        </Grid>
                        <Divider />
                        <Grid item xs={12}>
                            {
                                
                            }
                        </Grid>
                        <Grid item xs={12} className={classes.item} style={{display : "flex" , justifyContent:"space-between"}}>
                            <Box component={"span"}>
                                Est.APY
                            </Box>
                            {est_apy} %
                        </Grid>
                        <Grid item xs={12} className={classes.item}>
                            {
                                whichButton === 2 ? "If you unstake, you will forfeit all interest." : <></>
                            }
                        </Grid>
                        <Grid item xs={12} className={classes.item} style={{display : "flex" , justifyContent:"space-between"}}>
                            <Box component={"span"}>
                                { whichButton !== 2 ? "Estimated Interests" : "Current Interests"} <InfoIcon fontSize='20px'/>
                            </Box>
                            <Box component={"span"} style={{color : "#54cf9d" , fontWeight : "bold"}}>
                                { !isStaking ? Number(inputAmount) * est_apy * duration / 365 / 100 : (whichButton !== 2 ? Number(current_token.amount)  * est_apy * current_token.duration / 365 / 100 : estTokenAmount) }  {symbol} { whichButton === 2 ? " / " + estUSDAmount + "USD" : <></> }
                            </Box>
                        </Grid>
                        {
                            !isStaking ? <>
                                <Grid item xs={12} className={classes.item} style={{display:"flex" , alignItems:"center" }}>
                                    <Checkbox 
                                        icon={<RadioButtonUncheckedOutlinedIcon />}
                                        checkedIcon={<CheckCircleOutlineOutlinedIcon />}
                                        size='small'
                                        onChange={(e) => setIsAgree(e.target.checked)}
                                    /> I have read and agree to the &nbsp;<a href={`${PRIVATE_CALADEX_API}files/papers/Staking_Agreement.pdf`} target="_blank">Caladex Staking Service Agreement.</a>
                                </Grid>
                                <Grid item xs={12} style={{marginTop:"25px" , textAlign:"left"}}>
                                <Button varaint={"contained"} className={classes.stakeBtn} onClick={() => emitStakeEvent()} disabled={isAgree ? false : true} style={{opacity:isAgree ? 1 : 0.6}}>Confirm</Button>
                                </Grid>
                            </> : <></>
                        }
                        {
                            whichButton === 2 ? <Button variant="contained" className={classes.stakeBtn} sx={{marginTop:"20px"}} onClick={() => emitUnStake()}>Ok</Button> : ""
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        </div>
    )
}

const mapStateToProps = state => ({
    walletAddress : state.wallet.walletAddress
})
const mapDispatchToProps = {
    AddTokenStakeLog ,
    GetStakeDateTime ,
    GetTokenBalanceInfo
}

export default connect(mapStateToProps , mapDispatchToProps)(StakingDialog) ;