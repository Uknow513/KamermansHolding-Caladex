import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { connect } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Menubar from '../../components/Layouts/Menubar';
import TradeDataTable from '../../components/DataTable/TradeDataTable';
import { GetTradeList } from '../../redux/actions/trade';
import { Button, TextField } from '@mui/material';


const mdTheme = createTheme();

function TradeContent(props) {

  let {
    tradesData,
    GetTradeList,
  } = props;

  const [Tradeer, setTradeer] = useState('');
  const [start_time, setStartTime] = useState("2022-01-01");
  const [end_time, setEndTime] = useState("2100-01-01");
  const [type, setType] = useState('');


  useEffect(() => {
    const data = {
      start_time: "2022-01-01",
      end_time : "2100-01-01"
    };
    GetTradeList(data);
  }, []);


  const tabledata = tradesData ? tradesData : [];
  
  const tableheader = ["Time", "Account", "Pair", "Side", "Price", "Amount"];

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Menubar 
          CurrentPage = 'Trades'
        />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />

          <Grid sx={{pl: 5, pr: 5, mt:4, mb:4}}>
            {/* <Box display="flex" justifyContent="flex-end">
              <TextField id="account" label="Account" type="text" style={{minWidth : "400px"}} onChange={(e) => setTradeer(e.target.value)} />
              <Button variant='contained' color='primary' size='small'>Search</Button>
            </Box>  */}
            <TradeDataTable 
                tableheader = {tableheader}
                tabledata = {tabledata}
            />
          </Grid>
          
        </Box>
      </Box>
    </ThemeProvider>
  );
}


const mapStateToProps = state => ({
  tradesData: state.trade.tradesData,
  error: state.trade.error,
});

const mapDispatchToProps = {
  GetTradeList
};

export default connect(mapStateToProps, mapDispatchToProps)(TradeContent);