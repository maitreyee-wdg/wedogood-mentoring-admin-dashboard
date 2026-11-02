import { X } from "lucide-react"
import {
  FIELD_DEFINITIONS, STATUS_DEFINITIONS, NUMBER_STATUS_DEFINITIONS, GROUP_STATUS_DEFINITIONS,
  MEMBER_STATUS_CLS, NUMBER_STATUS_CLS, type MemberStatus,
} from "@/data/waGroupsData"

const th = "text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide"

export function WaDefinitionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-[760px] max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">WhatsApp group definitions</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-xs">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Member statuses: what sets each one</h3>
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 border-b border-gray-200"><th className={th}>Member</th><th className={th}>Status</th><th className={th}>Set when</th></tr></thead>
              <tbody>
                {STATUS_DEFINITIONS.map(d => (
                  <tr key={d.role + d.status} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.role}</td>
                    <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${MEMBER_STATUS_CLS[d.status as MemberStatus]}`}>{d.status}</span></td>
                    <td className="px-3 py-2 text-gray-700">{d.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-500 mt-2">
              Each mentor membership belongs to one request. When a mentor leaves, does not join, or is removed, that row keeps its final status
              and moves to Past mentors. The next mentor gets a new row. A mentor who returns on a later request (reconnect) also gets a new row.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Ops team number statuses</h3>
            <table className="w-full border border-gray-200">
              <thead><tr className="bg-gray-50 border-b border-gray-200"><th className={th}>Status</th><th className={th}>Whapi source</th><th className={th}>Meaning</th></tr></thead>
              <tbody>
                {NUMBER_STATUS_DEFINITIONS.map(d => (
                  <tr key={d.status} className="border-b border-gray-100">
                    <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${NUMBER_STATUS_CLS[d.status]}`}>{d.status}</span></td>
                    <td className="px-3 py-2 text-gray-500 font-mono">{d.whapi}</td>
                    <td className="px-3 py-2 text-gray-700">{d.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Group statuses</h3>
            <table className="w-full border border-gray-200">
              <tbody>
                {GROUP_STATUS_DEFINITIONS.map(d => (
                  <tr key={d.status} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-900 w-28">{d.status}</td>
                    <td className="px-3 py-2 text-gray-700">{d.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Fields</h3>
            <table className="w-full border border-gray-200">
              <tbody>
                {FIELD_DEFINITIONS.map(d => (
                  <tr key={d.field} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-900 w-44 align-top">{d.field}</td>
                    <td className="px-3 py-2 text-gray-700">{d.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  )
}
