import React, { useState } from 'react';
import { Card, Button } from '@ui';
import {
  AlertTriangle,
  TrendingUp,
  User,
  FileText,
  DollarSign,
  Calendar,
  Shield,
  Eye,
  X
} from 'lucide-react';

const FraudDetection = () => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock fraud data - in real app, this would come from API
  const fraudAlerts = [
    {
      id: '1',
      claimNumber: 'CLM-2024-001',
      customer: 'John Doe',
      riskScore: 85,
      riskLevel: 'high',
      reason: 'Multiple claims in short period',
      claimAmount: 5000,
      date: '2024-12-10',
      indicators: [
        'Claim frequency abnormal',
        'Inconsistent incident details',
        'Previous fraud history'
      ]
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-002',
      customer: 'Jane Smith',
      riskScore: 65,
      riskLevel: 'medium',
      reason: 'Unusual claim pattern',
      claimAmount: 3200,
      date: '2024-12-09',
      indicators: [
        'Claim timing suspicious',
        'Documentation quality poor'
      ]
    },
    {
      id: '3',
      claimNumber: 'CLM-2024-003',
      customer: 'Mike Johnson',
      riskScore: 45,
      riskLevel: 'low',
      reason: 'Minor inconsistencies',
      claimAmount: 1500,
      date: '2024-12-08',
      indicators: [
        'Minor data discrepancies'
      ]
    }
  ];

  const getRiskColor = (level) => {
    const colors = {
      high: 'red',
      medium: 'yellow',
      low: 'blue'
    };
    return colors[level] || 'gray';
  };

  const getRiskIcon = (level) => {
    if (level === 'high') return AlertTriangle;
    if (level === 'medium') return TrendingUp;
    return Shield;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fraud Detection</h1>
          <p className="text-gray-300">Monitor and analyze suspicious claims</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="backdrop-blur-lg bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-sm text-gray-300">High Risk</div>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">7</div>
                <div className="text-sm text-gray-300">Medium Risk</div>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">15</div>
                <div className="text-sm text-gray-300">Low Risk</div>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">45K</div>
                <div className="text-sm text-gray-300">Saved (TND)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fraud Alerts */}
        <div className="space-y-4">
          {fraudAlerts.map(alert => {
            const RiskIcon = getRiskIcon(alert.riskLevel);
            const riskColor = getRiskColor(alert.riskLevel);

            return (
              <Card
                key={alert.id}
                className={`backdrop-blur-lg bg-white/10 border-2 border-${riskColor}-500/50 hover:border-${riskColor}-500 transition-all`}
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 bg-${riskColor}-500/20 rounded-lg`}>
                    <RiskIcon className={`w-12 h-12 text-${riskColor}-400`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {alert.claimNumber}
                        </h3>
                        <p className="text-gray-400 text-sm">{alert.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold text-${riskColor}-400 mb-1`}>
                          {alert.riskScore}%
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${riskColor}-500/20 text-${riskColor}-400 border border-${riskColor}-500/30 uppercase`}>
                          {alert.riskLevel} RISK
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-xs text-gray-400">Customer</div>
                          <div className="text-sm font-medium">{alert.customer}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-xs text-gray-400">Date</div>
                          <div className="text-sm font-medium">
                            {new Date(alert.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-xs text-gray-400">Amount</div>
                          <div className="text-sm font-medium">{alert.claimAmount} TND</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-xs text-gray-400">Indicators</div>
                          <div className="text-sm font-medium">{alert.indicators.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Fraud Indicators:</div>
                      <div className="flex flex-wrap gap-2">
                        {alert.indicators.map((indicator, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs bg-${riskColor}-500/10 text-${riskColor}-300 border border-${riskColor}-500/30`}
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCase(alert);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button variant="primary" size="sm">
                        <FileText className="w-4 h-4" />
                        Investigate
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedCase && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Fraud Detection Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {selectedCase.claimNumber}
                    </h3>
                    <p className="text-gray-400">{selectedCase.customer}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold text-${getRiskColor(selectedCase.riskLevel)}-400 mb-1`}>
                      {selectedCase.riskScore}%
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getRiskColor(selectedCase.riskLevel)}-500/20 text-${getRiskColor(selectedCase.riskLevel)}-400 border border-${getRiskColor(selectedCase.riskLevel)}-500/30 uppercase`}>
                      {selectedCase.riskLevel} RISK
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-3">Fraud Indicators</h4>
                  <div className="space-y-2">
                    {selectedCase.indicators.map((indicator, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <AlertTriangle className={`w-5 h-5 text-${getRiskColor(selectedCase.riskLevel)}-400 flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-300">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Claim Amount</div>
                    <div className="text-white font-bold text-lg">{selectedCase.claimAmount} TND</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Date Submitted</div>
                    <div className="text-white font-medium">
                      {new Date(selectedCase.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary">
                    <FileText className="w-4 h-4" />
                    Full Investigation
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Box */}
        <Card className="mt-8 backdrop-blur-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">About Fraud Detection</h3>
              <p className="text-gray-300 text-sm mb-3">
                Our AI-powered fraud detection system analyzes claims in real-time to identify suspicious patterns and anomalies.
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>High Risk (70-100%):</strong> Immediate investigation required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>Medium Risk (40-69%):</strong> Additional verification needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>Low Risk (0-39%):</strong> Standard review process</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FraudDetection;
