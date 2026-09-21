export const UXUI_GROUP_ID = 'uxui'

export const UXUI_DESIGNER_EMAILS = [
  'sulkiflee.sam@axonstech.com',
  'orawan.ons@axonstech.com',
  'amarat.kul@axonstech.com',
  'panya.tue@axonstech.com',
  'wimolmanee.cha@axonstech.com',
  'apichart.mai@axonstech.com',
  'budsaracum.sri@axonstech.com',
  'kasama.chi@axonstech.com',
  'nichapath.pia@axonstech.com',
  'chakkawan.the@axonstech.com',
  'suppachai.pua@axonstech.com',
  'sirinya.ban@axonstech.com',
  'supphakan.phe@axonstech.com',
  'panyawuth.cha@axonstech.com',
  'phinyaphat.kia@axonstech.com',
  'jurapan.kai@axonstech.com',
  'yosita.map@axonstech.com',
  'ratana.kan@axonstech.com',
  'kittika.kra@axonstech.com',
  'sonetat.lee@axonstech.com',
  'pochara.kij@axonstech.com',
  'sutisa.pho@axonstech.com',
  'charinrat.sup@axonstech.com',
  'krittapak.kit@axonstech.com',
  'thananya.cem@axonstech.com',
  'chananan.sri@axonstech.com',
  'suchada.pon@axonstech.com',
  'pavinee.ros@axonstech.com',
  'kadsara.jam@axonstech.com',
  'waranya.orr@axonstech.com',
  'darene.kae@axonstech.com',
  'thanabodin.cha@axonstech.com',
  'nattawat.plu@axonstech.com',
  'pattarawadee.jee@axonstech.com',
  'aksornsil.nil@axonstech.com',
  'nitipol.lao@axonstech.com',
  'nuttakarn.cha@axonstech.com',
  'nanchaya.chi@axonstech.com',
  'supapat.phu@axonstech.com',
  'thanyaporn.mun@axonstech.com',
  'numchai.sit@axonstech.com',
  'athamin.ang@axonstech.com',
  'nuttida.yam@axonstech.com',
  'panasin.pet@axonstech.com',
  'chonlapatr.udo@axonstech.com',
  'nathawat.sae@axonstech.com',
  'nichaphat.suw@axonstech.com',
  'thunyawat.ket@axonstech.com',
  'tanapong.kor@axonstech.com',
  'nantichar.pot@axonstech.com',
  'kewalin.cha@axonstech.com',
  'mean.kea@axonstech.com',
  'preedapong.don@axonstech.com',
  'naphat.won@axonstech.com',
  'jeeranun.poo@axonstech.com',
  'chomphunuch.aun@axonstech.com',
  'melada.lua@axonstech.com',
  'game.phu@axonstech.com',
  'jiraporn.del@axonstech.com',
  'pannalak.tec@axonstech.com',
  'pachara.bua@axonstech.com',
  'wasin.dua@axonstech.com',
  'alisa.pon@axonstech.com',
  'sirachat.dec@axonstech.com',
  'sirawit.aks@axonstech.com',
  'angwara.sae@axonstech.com',
  'nutthida.amo@axonstech.com',
  'sawanya.sae@axonstech.com',
  'chutipa.niy@axonstech.com',
  'krittiya.onl@axonstech.com',
  'suchawadee.sri@axonstech.com',
  'pitchayaporn.poo@axonstech.com',
  'nuttamon.cho@axonstech.com',
  'nattawat.tan@axonstech.com',
  'wannakan.tan@axonstech.com',
  'tassapon.yaw@axonstech.com',
  'katthakorn.phi@axonstech.com',
  'waraphorn.wac@axonstech.com',
  'kandon.sas@axonstech.com',
  'apisak.may@axonstech.com',
  'lita.sir@axonstech.com',
  'nachapon.har@axonstech.com',
  'thanyaphat.tae@axonstech.com',
  'natchaya.ser@axonstech.com',
  'pornpong.sop@axonstech.com',
  'sira.han@axonstech.com',
  'chanitha.boo@axonstech.com',
  'narat.puh@axonstech.com',
  'paphangkor.pru@axonstech.com',
  'chayanat.pho@axonstech.com',
  'piraya.oth@axonstech.com',
  'piyawan.chl@axonstech.com',
  'natthakit.sus@axonstech.com',
  'supisara.wor@axonstech.com',
  'chanathip.mit@axonstech.com',
  'kollathi.yep@axonstech.com',
] as const

export interface PeopleGroup {
  id: string
  name: string
  emails: readonly string[]
}

export const GROUPS: PeopleGroup[] = [
  {
    id: UXUI_GROUP_ID,
    name: 'UX/UI Designer',
    emails: UXUI_DESIGNER_EMAILS,
  },
]

export const ACTIVE_GROUP = GROUPS[0]

const GROUP_EMAIL_SET = new Set(ACTIVE_GROUP.emails.map((email) => email.toLowerCase()))

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function inActiveGroup(email: string): boolean {
  return GROUP_EMAIL_SET.has(normalizeEmail(email))
}
