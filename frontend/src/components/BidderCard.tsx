import type { BidderResult } from '../types/api'
import YellowFlagBadge from './YellowFlagBadge'

interface BidderCardProps {
  bidder: BidderResult
}

export default function BidderCard({ bidder }: BidderCardProps) {
  const needsReviewCount = bidder.criterion_results.filter((c) => c.verdict === 'NEEDS_REVIEW').length

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-slate-800">{bidder.bidder_name}</p>
        <p className="text-sm text-slate-500">{bidder.bidder_id}</p>
      </div>
      <div className="flex items-center gap-3">
        {needsReviewCount > 0 && <YellowFlagBadge count={needsReviewCount} />}
        <span
          className={`px-3 py-1 text-sm rounded-lg ${
            bidder.overall_verdict === 'ELIGIBLE'
              ? 'bg-green-100 text-green-700'
              : bidder.overall_verdict === 'NOT_ELIGIBLE'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {bidder.overall_verdict.replace('_', ' ')}
        </span>
        <span className="text-sm text-slate-500">{Math.round(bidder.overall_confidence * 100)}%</span>
      </div>
    </div>
  )
}