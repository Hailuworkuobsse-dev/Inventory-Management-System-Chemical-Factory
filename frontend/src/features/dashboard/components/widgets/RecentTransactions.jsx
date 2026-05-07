import { ArrowUpRight, ArrowDownRight, Package, ShoppingCart, Truck, AlertTriangle } from 'lucide-react';

const RecentTransactions = () => {
  // Mock data - will be replaced with API data
  const transactions = [
    { 
      id: 1, 
      type: 'receipt', 
      description: 'Received 50 units of Widget A', 
      date: '2024-01-15 10:30', 
      user: 'John Doe',
      reference: 'GRN-2024-001'
    },
    { 
      id: 2, 
      type: 'sale', 
      description: 'Sold 25 units of Component X', 
      date: '2024-01-15 09:15', 
      user: 'Jane Smith',
      reference: 'SO-2024-045'
    },
    { 
      id: 3, 
      type: 'transfer', 
      description: 'Transferred 100 units from Warehouse A to B', 
      date: '2024-01-15 08:45', 
      user: 'Mike Johnson',
      reference: 'TRF-2024-012'
    },
    { 
      id: 4, 
      type: 'adjustment', 
      description: 'Adjusted stock - damaged goods', 
      date: '2024-01-14 16:20', 
      user: 'Sarah Wilson',
      reference: 'ADJ-2024-008',
      alert: true
    },
    { 
      id: 5, 
      type: 'receipt', 
      description: 'Received 200 units of Part Y', 
      date: '2024-01-14 14:00', 
      user: 'John Doe',
      reference: 'GRN-2024-002'
    },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'receipt':
        return <Truck className="h-5 w-5 text-green-600" />;
      case 'sale':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'transfer':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'adjustment':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'receipt':
        return 'bg-green-100';
      case 'sale':
        return 'bg-blue-100';
      case 'transfer':
        return 'bg-purple-100';
      case 'adjustment':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <a href="/inventory/receipts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all →
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.alert ? 'bg-yellow-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {transaction.reference}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing last 5 transactions
        </p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
