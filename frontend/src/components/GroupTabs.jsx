import React from 'react'

function GroupTabs({ groups, groupOrder, activeGroup, onTabChange }) {
  if (!groups) return null

  const getIssueCount = (groupKey) => {
    const group = groups[groupKey]
    if (!group?.dimensions) return 0
    return Object.values(group.dimensions).reduce((sum, dim) => sum + (dim.issues?.length || 0), 0)
  }

  const getBadgeClass = (count) => {
    if (count === 0) return 'badge-green'
    if (count <= 3) return 'badge-amber'
    return 'badge-red'
  }

  return (
    <div className="group-tabs">
      {groupOrder.map(groupKey => {
        const group = groups[groupKey]
        if (!group) return null
        const issueCount = getIssueCount(groupKey)
        const isActive = activeGroup === groupKey

        return (
          <button
            key={groupKey}
            className={`group-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(groupKey)}
          >
            <span className="tab-label">{group.label}</span>
            <span className={`tab-badge ${getBadgeClass(issueCount)}`}>{issueCount}</span>
          </button>
        )
      })}
    </div>
  )
}

export default GroupTabs
