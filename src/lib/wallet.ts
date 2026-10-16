'use client';

export const AVALANCHE_FUJI_PARAMS = {
  chainId: '0xa869', // 43113 in hex
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export type WalletType = 'metamask' | 'burner' | null;

export interface WalletState {
  address: string | null;
  walletType: WalletType;
  chainId: string | null;
  isFuji: boolean;
}

/**
 * Switch or add Avalanche Fuji Testnet in MetaMask
 */
export async function switchToAvalancheFuji(): Promise<boolean> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return false;
  }

  const ethereum = (window as any).ethereum;

  try {
    // Attempt to switch to Fuji
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AVALANCHE_FUJI_PARAMS.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // 4902 error indicates chain is not added to MetaMask yet
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_FUJI_PARAMS],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Avalanche Fuji network to MetaMask:', addError);
        return false;
      }
    }
    console.error('Failed to switch to Avalanche Fuji network:', switchError);
    return false;
  }
}

/**
 * Connect to MetaMask and request user accounts
 */
export async function connectMetaMaskWallet(): Promise<{ address: string; isFuji: boolean } | null> {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask browser extension or use Burner Wallet.');
  }

  // Request accounts
  const accounts: string[] = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in MetaMask.');
  }

  const address = accounts[0];

  // Check and prompt network switch to Fuji
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  let isFuji = chainId?.toLowerCase() === AVALANCHE_FUJI_PARAMS.chainId.toLowerCase();

  if (!isFuji) {
    const switched = await switchToAvalancheFuji();
    if (switched) {
      const updatedChain = await ethereum.request({ method: 'eth_chainId' });
      isFuji = updatedChain?.toLowerCase() === AVALANCHE_FUJI_PARAMS.chainId.toLowerCase();
    }
  }

  // Persist to localStorage
  localStorage.setItem('tastechain_active_wallet', address);
  localStorage.setItem('tastechain_wallet_type', 'metamask');

  // Broadcast custom event so all pages/navbars update synchronously
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tastechain_wallet_changed', {
        detail: { address, walletType: 'metamask', isFuji },
      })
    );
  }

  return { address, isFuji };
}

/**
 * Get current active wallet (either MetaMask or Burner Wallet)
 */
export function getStoredWallet(): { address: string | null; walletType: WalletType } {
  if (typeof window === 'undefined') {
    return { address: null, walletType: null };
  }

  const type = (localStorage.getItem('tastechain_wallet_type') as WalletType) || null;
  const address = localStorage.getItem('tastechain_active_wallet') || null;

  return { address, walletType: type };
}

/**
 * Set active burner wallet
 */
export function setBurnerWallet(address: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tastechain_active_wallet', address);
  localStorage.setItem('tastechain_wallet_type', 'burner');
  localStorage.setItem('tastechain_burner_address', address);

  window.dispatchEvent(
    new CustomEvent('tastechain_wallet_changed', {
      detail: { address, walletType: 'burner', isFuji: true },
    })
  );
}

/**
 * Disconnect current active wallet
 */
export function disconnectWallet() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('tastechain_active_wallet');
  localStorage.removeItem('tastechain_wallet_type');

  window.dispatchEvent(
    new CustomEvent('tastechain_wallet_changed', {
      detail: { address: null, walletType: null, isFuji: false },
    })
  );
}
