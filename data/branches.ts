export interface Branch {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  x: number;
  y: number;
}

export const branches: readonly Branch[] = [
  {
    id: "bacolod",
    name: "Bacolod",
    region: "Region VI",
    city: "Bacolod City",
    address: "EL Court Building, Door 11, 1st Lacson Street, Brgy. 17, Bacolod City 6100",
    phone: "0963 300 2653",
    x: 221,
    y: 397,
  },
  {
    id: "cadiz",
    name: "Cadiz",
    region: "Region VI",
    city: "Cadiz City",
    address: "Desiree Bldg., Emerald St., San Eusebio Subd., Brgy. Zone 2, Cadiz City 6121",
    phone: "0963 027 5805",
    x: 221,
    y: 368,
  },
  {
    id: "pontevedra",
    name: "Pontevedra",
    region: "Region VI",
    city: "Negros Occidental",
    address: "Rizal St., Brgy. III (Poblacion), Pontevedra, Negros Occidental",
    phone: "0909 140 0474",
    x: 227,
    y: 426,
  },
  {
    id: "cagayan-de-oro",
    name: "Cagayan de Oro",
    region: "Region X",
    city: "Cagayan de Oro City",
    address: "#88 National Highway, Zone 7, 2F Total Gasoline Station, Bulua, Cagayan de Oro City",
    phone: "0905 102 1955",
    x: 334,
    y: 528,
  },
  {
    id: "tagum",
    name: "Tagum",
    region: "Region XI",
    city: "Tagum City",
    address: "Tagum City, Davao del Norte",
    phone: "0909 671 6850",
    x: 390,
    y: 552,
  },
  {
    id: "nabunturan",
    name: "Nabunturan",
    region: "Region XI",
    city: "Davao de Oro",
    address: "3F Bunyag Bldg., Purok 8, Poblacion, Nabunturan, Davao de Oro",
    phone: "0946 062 9296",
    x: 418,
    y: 548,
  },
  {
    id: "samal",
    name: "Samal",
    region: "Region XI",
    city: "IGACOS",
    address: "Purok 3, Sitio Pasig, Brgy. Peñaplata, IGACOS, Davao del Norte 8119",
    phone: "0965 256 1665",
    x: 387,
    y: 578,
  },
  {
    id: "mati",
    name: "Mati",
    region: "Region XI",
    city: "Davao Oriental",
    address: "Hardware Ville, Madang, Brgy. Central, Mati City, Davao Oriental",
    phone: "0917 100 9676",
    x: 444,
    y: 579,
  },
] as const;
