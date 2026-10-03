export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://kim-tsr.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Kim Tessier'
export const SITE_TITLE = 'Kim Tessier - DevSecOps'
export const SITE_DESCRIPTION = "Étudiant ingénieur cybersécurité à l'EPITA Rennes, à la recherche d'un stage de fin d'études en DevSecOps ou sécurité des infrastructures à partir de février 2027."
export const SITE_AUTHOR = 'Kim Tessier'

export const CONTACT = {
  email: 'kim.tessier07@gmail.com',
  linkedin: 'https://www.linkedin.com/in/kim-tessier-330262230',
  linkedinLabel: 'linkedin.com/in/kim-tessier-330262230',
  github: 'https://github.com/kim-tsr',
  githubLabel: 'github.com/kim-tsr',
  location: 'Rennes',
  cv: '/CV_Kim_Tessier.pdf',
}
