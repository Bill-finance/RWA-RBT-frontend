import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Check as CheckIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import WalletService from '../services/walletService';

// 添加钱包类型声明
declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
    bitkeep?: any;
  }
}

interface WalletConnectProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: number | string;
  right?: number | string;
  left?: number | string;
  bottom?: number | string;
}

const connectors = {
  metamask: {
    name: 'MetaMask',
    connector: new (require('@web3-react/injected-connector').InjectedConnector)({
      supportedChainIds: [1, 3, 4, 5, 42],
    }),
  },
  walletconnect: {
    name: 'WalletConnect',
    connector: new (require('@web3-react/walletconnect-connector').WalletConnectConnector)({
      rpc: { 1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY' },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
    }),
  },
};

const WalletConnect: React.FC<WalletConnectProps> = ({
  position = 'fixed',
  top = 64,
  right = 32,
  left,
  bottom,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] = useState<{ address: string; type: string } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } else {
        setError('请安装 MetaMask 钱包扩展');
      }
    } catch (err) {
      setError('连接钱包失败，请确保已安装并解锁钱包');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setCurrentWallet(null);
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    // 初始化时检查钱包状态
    const checkWalletStatus = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          } else {
            // 如果没有账户，确保清除所有状态
            setWalletAddress(null);
            setIsConnected(false);
            setCurrentWallet(null);
          }
        } catch (err) {
          console.error('Error checking accounts:', err);
          // 发生错误时也清除状态
          setWalletAddress(null);
          setIsConnected(false);
          setCurrentWallet(null);
        }
      } else {
        // 如果没有检测到钱包，清除所有状态
        setWalletAddress(null);
        setIsConnected(false);
        setCurrentWallet(null);
      }
    };

    // 立即检查一次钱包状态
    checkWalletStatus();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleOpen = () => {
    if (isConnected && walletAddress) {
      setAnchorEl(document.getElementById('wallet-button'));
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWallet(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
  };

  const handleConnect = async () => {
    if (selectedWallet) {
      try {
        const walletService = WalletService.getInstance();
        
        if (selectedWallet === 'metamask' && typeof window.ethereum === 'undefined') {
          setError('请安装 MetaMask 钱包扩展');
          return;
        }
        if (selectedWallet === 'okx' && typeof window.okxwallet === 'undefined') {
          setError('请安装 OKX 钱包扩展');
          return;
        }
        if (selectedWallet === 'bitget' && typeof window.bitkeep === 'undefined') {
          setError('请安装 Bitget 钱包扩展');
          return;
        }

        const walletInfo = await walletService.connectWallet(selectedWallet as any);
        setCurrentWallet(walletInfo);
        setWalletAddress(walletInfo.address);
        setIsConnected(true);
        handleClose();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setError('连接钱包失败，请确保已安装并解锁钱包');
      }
    }
  };

  const handleDisconnect = () => {
    const walletService = WalletService.getInstance();
    walletService.disconnectWallet();
    setCurrentWallet(null);
    setWalletAddress(null);
    setIsConnected(false);
    handleMenuClose();
  };

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: '最流行的以太坊钱包',
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '🟢',
      description: 'OKX交易所钱包',
    },
    {
      id: 'bitget',
      name: 'Bitget Wallet',
      icon: '🔵',
      description: 'Bitget交易所钱包',
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: '连接多个钱包',
    },
  ];

  return (
    <>
      <Button
        id="wallet-button"
        variant="contained"
        onClick={handleOpen}
        sx={{
          position,
          top,
          right,
          left,
          bottom,
          bgcolor: 'linear-gradient(90deg, #2e7d32 0%, #1b5e20 100%)',
          color: '#fff',
          boxShadow: 4,
          backdropFilter: 'blur(4px)',
          borderRadius: 3,
          px: 3,
          py: 1.5,
          fontWeight: 700,
          fontSize: 18,
          zIndex: 1300,
          opacity: 0.92,
          '&:hover': {
            bgcolor: 'linear-gradient(90deg, #1b5e20 0%, #003300 100%)',
            opacity: 1,
          },
        }}
      >
        {isConnected && walletAddress ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                },
              }}
            >
              <WalletIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Typography sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </Typography>
          </Box>
        ) : (
          'Connect Wallet'
        )}
      </Button>

      {error && (
        <Typography
          color="error"
          sx={{
            position: 'fixed',
            top: typeof top === 'number' ? top + 56 : '120px',
            right,
            bgcolor: 'rgba(255, 0, 0, 0.1)',
            padding: '8px 16px',
            borderRadius: 1,
            zIndex: 1300,
          }}
        >
          {error}
        </Typography>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleDisconnect}>
          <LogoutIcon sx={{ mr: 1 }} />
          断开连接
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>选择钱包</DialogTitle>
        <DialogContent>
          <List>
            {wallets.map((wallet) => (
              <ListItem
                key={wallet.id}
                button
                onClick={() => handleWalletSelect(wallet.id)}
                selected={selectedWallet === wallet.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon>
                  <Box sx={{ fontSize: 24 }}>{wallet.icon}</Box>
                </ListItemIcon>
                <ListItemText
                  primary={wallet.name}
                  secondary={wallet.description}
                />
                {selectedWallet === wallet.id && (
                  <CheckIcon color="primary" />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button
            onClick={handleConnect}
            variant="contained"
            color="primary"
            disabled={!selectedWallet}
          >
            连接
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletConnect; 