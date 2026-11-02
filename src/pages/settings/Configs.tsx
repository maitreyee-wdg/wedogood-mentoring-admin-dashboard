import { useState } from "react"
import { Button } from "@/components/ui/button"
import { mockSettings } from "@/data/settingsData"
import { Check, Settings as SettingsIcon, MessagesSquare } from "lucide-react"

export default function Configs() {
  const [maxEngagements, setMaxEngagements] = useState(mockSettings.maxConcurrentEngagementsPerVolunteer)
  const [joinLimitHours, setJoinLimitHours] = useState(mockSettings.mentorGroupJoinTimeLimitHours)
  const [removalDelayDays, setRemovalDelayDays] = useState(mockSettings.mentorRemovalDelayAfterExpiryDays)
  const [batchSize, setBatchSize] = useState(mockSettings.maxGroupsPerNumber)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    mockSettings.maxConcurrentEngagementsPerVolunteer = maxEngagements
    mockSettings.mentorGroupJoinTimeLimitHours = joinLimitHours
    mockSettings.mentorRemovalDelayAfterExpiryDays = removalDelayDays
    mockSettings.maxGroupsPerNumber = batchSize
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const dirty = maxEngagements !== mockSettings.maxConcurrentEngagementsPerVolunteer
    || joinLimitHours !== mockSettings.mentorGroupJoinTimeLimitHours
    || removalDelayDays !== mockSettings.mentorRemovalDelayAfterExpiryDays
    || batchSize !== mockSettings.maxGroupsPerNumber

  return (
    <div className="p-6 space-y-5 overflow-auto h-full max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide settings for matching and engagements</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Matching</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Max concurrent engagements per volunteer</label>
          <input
            type="number"
            min={1}
            value={maxEngagements}
            onChange={e => setMaxEngagements(Math.max(1, Number(e.target.value) || 1))}
            className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400">
            A volunteer already at this many active engagements can't be matched to another one, anywhere in the app, until one of theirs closes.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <MessagesSquare className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">WhatsApp groups</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Mentor join time limit (hours)</label>
          <input
            type="number"
            min={1}
            value={joinLimitHours}
            onChange={e => setJoinLimitHours(Math.max(1, Number(e.target.value) || 1))}
            className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400">
            After an accepted mentor gets the group joining link, they have this long to join. After that they are marked Did not join and the request moves to the next volunteer.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Remove mentor after expiry (days)</label>
          <input
            type="number"
            min={0}
            value={removalDelayDays}
            onChange={e => setRemovalDelayDays(Math.max(0, Number(e.target.value) || 0))}
            className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400">
            Days after a request moves to Expired before its mentor is removed from the mentee's WhatsApp group.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Max groups per AI number (batch size)</label>
          <input
            type="number"
            min={1}
            value={batchSize}
            onChange={e => setBatchSize(Math.max(1, Number(e.target.value) || 1))}
            className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400">
            An AI number stops receiving new groups once it holds this many. New groups go to the next AI number with space.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={!dirty}>Save</Button>
          {saved && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
