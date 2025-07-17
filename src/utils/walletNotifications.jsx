import toast from 'react-hot-toast';
import { FiDollarSign, FiGift, FiUsers } from 'react-icons/fi';

/**
 * Show a coin reward toast notification
 */
export const showCoinReward = (amount, reason, description) => {
  const getIcon = () => {
    switch (reason) {
      case 'order':
        return '🛍️';
      case 'referral':
        return '👥';
      case 'visit':
        return '👁️';
      case 'manual':
        return '🎁';
      default:
        return '🪙';
    }
  };

  const getTitle = () => {
    switch (reason) {
      case 'order':
        return 'Order Reward!';
      case 'referral':
        return 'Referral Bonus!';
      case 'visit':
        return 'Visit Reward!';
      case 'manual':
        return 'Bonus Coins!';
      default:
        return 'Coins Earned!';
    }
  };

  const getColor = () => {
    switch (reason) {
      case 'order':
        return 'from-green-500 to-emerald-600';
      case 'referral':
        return 'from-purple-500 to-pink-600';
      case 'visit':
        return 'from-blue-500 to-cyan-600';
      case 'manual':
        return 'from-orange-500 to-amber-600';
      default:
        return 'from-amber-500 to-yellow-600';
    }
  };

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r ${getColor()} shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">{getIcon()}</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {getTitle()}
            </p>
            <p className="text-xs text-white/90 mt-1">
              +{amount} Indira Coins {description ? `• ${description}` : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/20">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
        >
          <FiDollarSign className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};

/**
 * Show referral success notification
 */
export const showReferralSuccess = (referrerName, amount = 20) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              Welcome to the Family!
            </p>
            <p className="text-xs text-white/90 mt-1">
              {referrerName} earned +{amount} coins for referring you!
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/20">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
        >
          <FiGift className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right',
  });
};

/**
 * Show transaction success notification
 */
export const showTransactionSuccess = (type, amount, description) => {
  const isSpending = amount < 0;
  const absAmount = Math.abs(amount);
  
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r ${
        isSpending ? 'from-blue-500 to-indigo-600' : 'from-green-500 to-emerald-600'
      } shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {isSpending ? 'Coins Spent' : 'Coins Earned'}
            </p>
            <p className="text-xs text-white/90 mt-1">
              {isSpending ? '-' : '+'}{absAmount} Indira Coins {description ? `• ${description}` : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/20">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
        >
          ✓
        </button>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * Initialize wallet notifications listener
 * This should be called once in the main App component
 */
export const initializeWalletNotifications = () => {
  // Listen for wallet events from localStorage or custom events
  const handleWalletEvent = (event) => {
    const { type, data } = event.detail;
    
    switch (type) {
      case 'coins_earned':
        showCoinReward(data.amount, data.reason, data.description);
        break;
      case 'referral_success':
        showReferralSuccess(data.referrerName, data.amount);
        break;
      case 'transaction_complete':
        showTransactionSuccess(data.type, data.amount, data.description);
        break;
      default:
        break;
    }
  };

  // Add event listener for custom wallet events
  window.addEventListener('walletEvent', handleWalletEvent);

  // Return cleanup function
  return () => {
    window.removeEventListener('walletEvent', handleWalletEvent);
  };
};

/**
 * Trigger a wallet event
 */
export const triggerWalletEvent = (type, data) => {
  const event = new CustomEvent('walletEvent', {
    detail: { type, data }
  });
  window.dispatchEvent(event);
};

// CSS for animations (add to your global CSS)
export const walletNotificationStyles = `
  .animate-enter {
    animation: slideInRight 0.3s ease-out;
  }
  
  .animate-leave {
    animation: slideOutRight 0.2s ease-in;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
