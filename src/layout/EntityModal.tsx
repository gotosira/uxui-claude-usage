import { X } from 'lucide-react'
import { AxioBadge, AxioEmpty, AxioHintLabel, useLanguage } from '../axio'
import { composeShare, formatCompact, formatUsd } from '../data/aggregate'
import { displayModel, displayPerson } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { entityPeople, rankQueue } from '../data/rankings'
import { useLayout } from './LayoutContext'
import { DonutChart, RankBars } from '../dashboard/ChartKit'

export function EntityModal() {
  const { t } = useLanguage()
  const { entity, closeEntity, openPerson, rankId } = useLayout()
  const { scopedRows, topUsers, byProduct, byModel } = useFilters()

  if (!entity) return null

  const people = entityPeople(scopedRows, entity.kind, entity.id)
  const product = entity.kind === 'product' ? byProduct.find((item) => item.product === entity.id) : null
  const model = entity.kind === 'model' ? byModel.find((item) => item.model === entity.id) : null
  const title = entity.kind === 'product' ? entity.id : displayModel(entity.id)
  const spend = product?.spend ?? model?.spend ?? 0
  const requests = product?.requests ?? model?.requests ?? 0
  const users = product?.users ?? people.length
  const queue = people.length ? people.map((item) => item.email) : rankQueue(topUsers, rankId)
  const share = composeShare(
    people,
    (person) => person.email,
    (person) => displayPerson(person.email),
    (person) => person.spend,
    8,
    t.restOfTeam,
  )

  return (
    <div className="axio-drill-root">
      <button type="button" className="axio-search-scrim" aria-label={t.personClose} onClick={closeEntity} />
      <div className="axio-entity-modal" role="dialog" aria-modal="true" aria-labelledby="axio-entity-title">
        <header className="axio-person-head">
          <div className="axio-person-titleblock">
            <h2 id="axio-entity-title">{title}</h2>
            <p>{entity.kind === 'product' ? t.product : t.model}</p>
          </div>
          <button type="button" className="axio-icon-btn" onClick={closeEntity} aria-label={t.personClose}>
            <X size={20} />
          </button>
        </header>
        <div className="axio-person-body">
          <div className="axio-person-meta">
            <AxioBadge tone="info">{formatUsd(spend)}</AxioBadge>
            <AxioBadge tone="info">
              {formatCompact(requests)} {t.req.toLowerCase()}
            </AxioBadge>
            <AxioBadge>
              {users} {t.users.toLowerCase()}
            </AxioBadge>
          </div>
          <h3>
            <AxioHintLabel title={t.entityPeople} body={t.entityHint}>
              {t.entityPeople}
            </AxioHintLabel>
          </h3>
          {!people.length ? (
            <AxioEmpty>{t.emptyChart}</AxioEmpty>
          ) : (
            <>
              <DonutChart
                data={share}
                centerLabel={t.spendShare}
                onSelect={(email) => {
                  closeEntity()
                  openPerson(email, queue)
                }}
              />
              <RankBars
                data={people.map((person) => ({
                  id: person.email,
                  name: displayPerson(person.email),
                  value: person.spend,
                }))}
                onSelect={(email) => {
                  closeEntity()
                  openPerson(email, queue)
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
