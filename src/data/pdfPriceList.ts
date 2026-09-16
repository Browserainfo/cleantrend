// Master Price List imported accurately from Cleanera / Trendera Price-List PDF
import { GarmentMaster, GarmentCategory } from '../types';

export interface PriceListItem {
  service: string;
  category: string;
  name: string;
  itemCode: string;
  price: number;
}

export const rawPdfPriceList: PriceListItem[] = [
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Achkan",
    "itemCode": "AC",
    "price": 298
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Achkan Heavy",
    "itemCode": "ACH",
    "price": 370
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Achkan Very Heavy",
    "itemCode": "AVH",
    "price": 450
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Capri",
    "itemCode": "CA",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Coat",
    "itemCode": "C",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Dhoti",
    "itemCode": "DH",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFM",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHM",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Jacket with Hood",
    "itemCode": "JKH",
    "price": 240
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Jeans",
    "itemCode": "Je",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Kurta",
    "itemCode": "K",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Kurta Heavy",
    "itemCode": "KF",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Leather Jacket",
    "itemCode": "LJ",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Long Coat",
    "itemCode": "LCM",
    "price": 300
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Long Pullover",
    "itemCode": "LPUM",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Pants",
    "itemCode": "P",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Pyjama",
    "itemCode": "PYK",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Safari Suit Coat",
    "itemCode": "SSC",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Safari Suit Pant",
    "itemCode": "SSP",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Shawl Pankhi",
    "itemCode": "SAW",
    "price": 330
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sherwani",
    "itemCode": "SHE",
    "price": 298
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Shirt",
    "itemCode": "S",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Shirt Silk",
    "itemCode": "STS",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Shirt Woolen",
    "itemCode": "STW",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Shorts",
    "itemCode": "SH",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweat Pants",
    "itemCode": "SP",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweat Shirt",
    "itemCode": "SW",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 380
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFM",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPM",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweater Half",
    "itemCode": "SWS",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SWF",
    "price": 230
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Swimming Costume",
    "itemCode": "SC",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "T Shirt",
    "itemCode": "TF",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Track Pant",
    "itemCode": "TP",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Track Suit Upper",
    "itemCode": "TSU",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Under Wear",
    "itemCode": "UW",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Vest",
    "itemCode": "Vest",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Men",
    "name": "Waist Coat",
    "itemCode": "WC",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Achkan",
    "itemCode": "AC",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Achkan Heavy",
    "itemCode": "ACH",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Achkan Very Heavy",
    "itemCode": "AVH",
    "price": 140
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Capri",
    "itemCode": "CA",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Coat",
    "itemCode": "C",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Dhoti",
    "itemCode": "DH",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFM",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHM",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Jacket with Hood",
    "itemCode": "JKH",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Jeans",
    "itemCode": "Je",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Kurta",
    "itemCode": "K",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Kurta Heavy",
    "itemCode": "KF",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Leather Jacket",
    "itemCode": "LJ",
    "price": 120
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Long Coat",
    "itemCode": "LCM",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Long Pullover",
    "itemCode": "LPUM",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Pants",
    "itemCode": "P",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Pyjama",
    "itemCode": "PYK",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Safari Suit Coat",
    "itemCode": "SSC",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Safari Suit Pant",
    "itemCode": "SSP",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Shawl Pankhi",
    "itemCode": "SAW",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sherwani",
    "itemCode": "SHE",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Shirt",
    "itemCode": "S",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Shirt Silk",
    "itemCode": "STS",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Shirt Woolen",
    "itemCode": "STW",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Shorts",
    "itemCode": "SH",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweat Pants",
    "itemCode": "SP",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweat Shirt",
    "itemCode": "SW",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFM",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPM",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweater Half",
    "itemCode": "SWS",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SWF",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Swimming Costume",
    "itemCode": "SC",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "T Shirt",
    "itemCode": "TF",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Track Pant",
    "itemCode": "TP",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Track Suit Upper",
    "itemCode": "TSU",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Under Wear",
    "itemCode": "UW",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Vest",
    "itemCode": "Vest",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Men",
    "name": "Waist Coat",
    "itemCode": "WC",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Achkan",
    "itemCode": "AC",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Achkan Heavy",
    "itemCode": "ACH",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Achkan Very Heavy",
    "itemCode": "AVH",
    "price": 180
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Capri",
    "itemCode": "CA",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Coat",
    "itemCode": "C",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Dhoti",
    "itemCode": "DH",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFM",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHM",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Jacket with Hood",
    "itemCode": "JKH",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Jeans",
    "itemCode": "Je",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Kurta",
    "itemCode": "K",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Kurta Heavy",
    "itemCode": "KF",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Leather Jacket",
    "itemCode": "LJ",
    "price": 160
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Long Coat",
    "itemCode": "LCM",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Long Pullover",
    "itemCode": "LPUM",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Pants",
    "itemCode": "P",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Pyjama",
    "itemCode": "PYK",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Safari Suit Coat",
    "itemCode": "SSC",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Safari Suit Pant",
    "itemCode": "SSP",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Shawl Pankhi",
    "itemCode": "SAW",
    "price": 130
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sherwani",
    "itemCode": "SHE",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Shirt",
    "itemCode": "S",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Shirt Silk",
    "itemCode": "STS",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Shirt Woolen",
    "itemCode": "STW",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Shorts",
    "itemCode": "SH",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweat Pants",
    "itemCode": "SP",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweat Shirt",
    "itemCode": "SW",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFM",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPM",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweater Half",
    "itemCode": "SWS",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SWF",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Swimming Costume",
    "itemCode": "SC",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "T Shirt",
    "itemCode": "TF",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Track Pant",
    "itemCode": "TP",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Track Suit Upper",
    "itemCode": "TSU",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Under Wear",
    "itemCode": "UW",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Vest",
    "itemCode": "Vest",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Men",
    "name": "Waist Coat",
    "itemCode": "WC",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Achkan",
    "itemCode": "AC",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Achkan Heavy",
    "itemCode": "ACH",
    "price": 480
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Achkan Very Heavy",
    "itemCode": "AVH",
    "price": 590
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Capri",
    "itemCode": "CA",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Coat",
    "itemCode": "C",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Dhoti",
    "itemCode": "DH",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFM",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHM",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Jacket with Hood",
    "itemCode": "JKH",
    "price": 310
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Jeans",
    "itemCode": "Je",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Kurta",
    "itemCode": "K",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Kurta Heavy",
    "itemCode": "KF",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Leather Jacket",
    "itemCode": "LJ",
    "price": 520
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Long Coat",
    "itemCode": "LCM",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Long Pullover",
    "itemCode": "LPUM",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Pants",
    "itemCode": "P",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Pyjama",
    "itemCode": "PYK",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Safari Suit Coat",
    "itemCode": "SSC",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Safari Suit Pant",
    "itemCode": "SSP",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Shawl Pankhi",
    "itemCode": "SAW",
    "price": 430
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sherwani",
    "itemCode": "SHE",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Shirt",
    "itemCode": "S",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Shirt Silk",
    "itemCode": "STS",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Shirt Woolen",
    "itemCode": "STW",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Shorts",
    "itemCode": "SH",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweat Pants",
    "itemCode": "SP",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweat Shirt",
    "itemCode": "SW",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 490
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFM",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPM",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweater Half",
    "itemCode": "SWS",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SWF",
    "price": 300
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Swimming Costume",
    "itemCode": "SC",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "T Shirt",
    "itemCode": "TF",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Track Pant",
    "itemCode": "TP",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Track Suit Upper",
    "itemCode": "TSU",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Under Wear",
    "itemCode": "UW",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Vest",
    "itemCode": "Vest",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Men",
    "name": "Waist Coat",
    "itemCode": "WC",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Blouse",
    "itemCode": "B",
    "price": 70
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Blouse Heavy",
    "itemCode": "BHW",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Blouse Very Heavy",
    "itemCode": "BH",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Brassieres",
    "itemCode": "Bra",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Bridal Lehnga Blouse",
    "itemCode": "BLB",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Bridal Lehnga Skirt",
    "itemCode": "BLS",
    "price": 730
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Capri",
    "itemCode": "Cap",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Coat",
    "itemCode": "CL",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dangree",
    "itemCode": "DAN",
    "price": 170
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dress long Heavy",
    "itemCode": "DLFTSO",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dress long Plain",
    "itemCode": "DLP",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dress long Very Heavy",
    "itemCode": "DLH",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dress Plain",
    "itemCode": "DP",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dress Very Heavy",
    "itemCode": "DRH",
    "price": 230
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dupatta",
    "itemCode": "DUP",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dupatta Heavy",
    "itemCode": "DHW",
    "price": 90
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Dupatta Very Heavy",
    "itemCode": "DPH",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFW",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHW",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Jacket with Hood",
    "itemCode": "JWH",
    "price": 240
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Jeans",
    "itemCode": "JeF",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Jumper",
    "itemCode": "JU",
    "price": 170
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Kurta Heavy",
    "itemCode": "KTH",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Kurta Plain",
    "itemCode": "KPW",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHW",
    "price": 230
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Legging",
    "itemCode": "LGG",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Lehnga Heavy",
    "itemCode": "LF",
    "price": 530
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Lehnga Plain",
    "itemCode": "LPW",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Lehnga Very Heavy",
    "itemCode": "LH",
    "price": 670
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Long Coat",
    "itemCode": "LCF",
    "price": 300
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Long Pullover",
    "itemCode": "LPUW",
    "price": 380
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Nighty(Gown)",
    "itemCode": "NG",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Pants",
    "itemCode": "PF",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Petticoat",
    "itemCode": "PTC",
    "price": 70
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Plazo Heavy",
    "itemCode": "PHW",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Plazo Plain",
    "itemCode": "PPW",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Plazo Very Heavy",
    "itemCode": "PH",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Pyjama",
    "itemCode": "PY",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Salwar Heavy",
    "itemCode": "SLF",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Salwar Plain",
    "itemCode": "SPW",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Salwar Very Heavy",
    "itemCode": "SLH",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Saree Heavy",
    "itemCode": "SHY",
    "price": 260
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Saree Plain",
    "itemCode": "SRPW",
    "price": 175
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Saree Very Heavy",
    "itemCode": "SAH",
    "price": 340
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Scarf",
    "itemCode": "Sca",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Shawl Heavy",
    "itemCode": "SLHW",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Shawl Pashmina",
    "itemCode": "SHP",
    "price": 430
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Shawl Plain",
    "itemCode": "SHLP",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Shawl Very Heavy",
    "itemCode": "SWL",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Shirt",
    "itemCode": "Shi",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Long Heavy",
    "itemCode": "SLFW",
    "price": 170
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Long Plain",
    "itemCode": "SLPW",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Long Very Heavy",
    "itemCode": "SLTSO",
    "price": 220
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Short Heavy",
    "itemCode": "SSF",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Short Plain",
    "itemCode": "SS2",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Skirt Short Very Heavy",
    "itemCode": "SS3",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Slacks",
    "itemCode": "SLA",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Stocking",
    "itemCode": "sto",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Stole Heavy",
    "itemCode": "STF",
    "price": 90
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Stole Plain",
    "itemCode": "STPW",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Stole Very Heavy",
    "itemCode": "STH",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 380
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFFW",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPW",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "WSW",
    "price": 230
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPW",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Swimming Costume",
    "itemCode": "SCO",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "T Shirt",
    "itemCode": "T",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Top Heavy",
    "itemCode": "TPHW",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Top Plain",
    "itemCode": "TOPW",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Top Very Heavy",
    "itemCode": "THW",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Top Woollen",
    "itemCode": "TWW",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Track Pant",
    "itemCode": "Tpa",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Panty",
    "itemCode": "PNT",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Sweat Shirt",
    "itemCode": "SWX",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Puan",
    "itemCode": "PUN",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Burkha Plain",
    "itemCode": "BRP",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Burkha Heavy",
    "itemCode": "BRH",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Women",
    "name": "Burkha Very Heavy",
    "itemCode": "BVH",
    "price": 310
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Blouse",
    "itemCode": "B",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Blouse Heavy",
    "itemCode": "BHW",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Blouse Very Heavy",
    "itemCode": "BH",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Brassieres",
    "itemCode": "Bra",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Bridal Lehnga Blouse",
    "itemCode": "BLB",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Bridal Lehnga Skirt",
    "itemCode": "BLS",
    "price": 220
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Capri",
    "itemCode": "Cap",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Coat",
    "itemCode": "CL",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dangree",
    "itemCode": "DAN",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dress long Heavy",
    "itemCode": "DLFTSO",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dress long Plain",
    "itemCode": "DLP",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dress long Very Heavy",
    "itemCode": "DLH",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dress Plain",
    "itemCode": "DP",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Dress Very Heavy",
    "itemCode": "DRH",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFFW",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPW",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "WSW",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPW",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Swimming Costume",
    "itemCode": "SCO",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "T Shirt",
    "itemCode": "T",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Top Heavy",
    "itemCode": "TPHW",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Top Plain",
    "itemCode": "TOPW",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Top Very Heavy",
    "itemCode": "THW",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Top Woollen",
    "itemCode": "TWW",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Track Pant",
    "itemCode": "Tpa",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Panty",
    "itemCode": "PNT",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Sweat Shirt",
    "itemCode": "SWX",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Puan",
    "itemCode": "PUN",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Burkha Plain",
    "itemCode": "BRP",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Burkha Heavy",
    "itemCode": "BRH",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Women",
    "name": "Burkha Very Heavy",
    "itemCode": "BVH",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Blouse",
    "itemCode": "B",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Blouse Heavy",
    "itemCode": "BHW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Blouse Very Heavy",
    "itemCode": "BH",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Brassieres",
    "itemCode": "Bra",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Bridal Lehnga Blouse",
    "itemCode": "BLB",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Bridal Lehnga Skirt",
    "itemCode": "BLS",
    "price": 290
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Capri",
    "itemCode": "Cap",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Coat",
    "itemCode": "CL",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dangree",
    "itemCode": "DAN",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dress long Heavy",
    "itemCode": "DLFTSO",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dress long Plain",
    "itemCode": "DLP",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dress long Very Heavy",
    "itemCode": "DLH",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dress Plain",
    "itemCode": "DP",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dress Very Heavy",
    "itemCode": "DRH",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dupatta",
    "itemCode": "DUP",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dupatta Heavy",
    "itemCode": "DHW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Dupatta Very Heavy",
    "itemCode": "DPH",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Jacket with Hood",
    "itemCode": "JWH",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Jeans",
    "itemCode": "JeF",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Jumper",
    "itemCode": "JU",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Kurta Heavy",
    "itemCode": "KTH",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Kurta Plain",
    "itemCode": "KPW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHW",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Legging",
    "itemCode": "LGG",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Lehnga Heavy",
    "itemCode": "LF",
    "price": 210
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Lehnga Plain",
    "itemCode": "LPW",
    "price": 160
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Lehnga Very Heavy",
    "itemCode": "LH",
    "price": 260
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Long Coat",
    "itemCode": "LCF",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Long Pullover",
    "itemCode": "LPUW",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Nighty(Gown)",
    "itemCode": "NG",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Pants",
    "itemCode": "PF",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Petticoat",
    "itemCode": "PTC",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Plazo Heavy",
    "itemCode": "PHW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Plazo Plain",
    "itemCode": "PPW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Plazo Very Heavy",
    "itemCode": "PH",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Pyjama",
    "itemCode": "PY",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Salwar Heavy",
    "itemCode": "SLF",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Salwar Plain",
    "itemCode": "SPW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Salwar Very Heavy",
    "itemCode": "SLH",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Saree Heavy",
    "itemCode": "SHY",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Saree Plain",
    "itemCode": "SRPW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Saree Very Heavy",
    "itemCode": "SAH",
    "price": 130
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Scarf",
    "itemCode": "Sca",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Shawl Heavy",
    "itemCode": "SLHW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Shawl Pashmina",
    "itemCode": "SHP",
    "price": 170
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Shawl Plain",
    "itemCode": "SHLP",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Shawl Very Heavy",
    "itemCode": "SWL",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Shirt",
    "itemCode": "Shi",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Long Heavy",
    "itemCode": "SLFW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Long Plain",
    "itemCode": "SLPW",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Long Very Heavy",
    "itemCode": "SLTSO",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Short Heavy",
    "itemCode": "SSF",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Short Plain",
    "itemCode": "SS2",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Skirt Short Very Heavy",
    "itemCode": "SS3",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Slacks",
    "itemCode": "SLA",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Stocking",
    "itemCode": "sto",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Stole Heavy",
    "itemCode": "STF",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Stole Plain",
    "itemCode": "STPW",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Stole Very Heavy",
    "itemCode": "STH",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFFW",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPW",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "WSW",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Swimming Costume",
    "itemCode": "SCO",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "T Shirt",
    "itemCode": "T",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Top Heavy",
    "itemCode": "TPHW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Top Plain",
    "itemCode": "TOPW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Top Very Heavy",
    "itemCode": "THW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Top Woollen",
    "itemCode": "TWW",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Track Pant",
    "itemCode": "Tpa",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Panty",
    "itemCode": "PNT",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Sweat Shirt",
    "itemCode": "SWX",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Puan",
    "itemCode": "PUN",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Burkha Plain",
    "itemCode": "BRP",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Burkha Heavy",
    "itemCode": "BRH",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Women",
    "name": "Burkha Very Heavy",
    "itemCode": "BVH",
    "price": 120
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Blouse",
    "itemCode": "B",
    "price": 90
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Blouse Heavy",
    "itemCode": "BHW",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Blouse Very Heavy",
    "itemCode": "BH",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Brassieres",
    "itemCode": "Bra",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Bridal Lehnga Blouse",
    "itemCode": "BLB",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Bridal Lehnga Skirt",
    "itemCode": "BLS",
    "price": 950
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Capri",
    "itemCode": "Cap",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Coat",
    "itemCode": "CL",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dangree",
    "itemCode": "DAN",
    "price": 220
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dress long Heavy",
    "itemCode": "DLFTSO",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dress long Plain",
    "itemCode": "DLP",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dress long Very Heavy",
    "itemCode": "DLH",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dress Plain",
    "itemCode": "DP",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dress Very Heavy",
    "itemCode": "DRH",
    "price": 300
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dupatta",
    "itemCode": "DUP",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dupatta Heavy",
    "itemCode": "DHW",
    "price": 120
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Dupatta Very Heavy",
    "itemCode": "DPH",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFW",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHW",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Jacket with Hood",
    "itemCode": "JWH",
    "price": 310
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Jeans",
    "itemCode": "JeF",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Jumper",
    "itemCode": "JU",
    "price": 220
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Kurta Heavy",
    "itemCode": "KTH",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Kurta Plain",
    "itemCode": "KPW",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHW",
    "price": 300
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Legging",
    "itemCode": "LGG",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Lehnga Heavy",
    "itemCode": "LF",
    "price": 690
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Lehnga Plain",
    "itemCode": "LPW",
    "price": 520
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Lehnga Very Heavy",
    "itemCode": "LH",
    "price": 870
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Long Coat",
    "itemCode": "LCF",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Long Pullover",
    "itemCode": "LPUW",
    "price": 490
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Nighty(Gown)",
    "itemCode": "NG",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Pants",
    "itemCode": "PF",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Petticoat",
    "itemCode": "PTC",
    "price": 90
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Plazo Heavy",
    "itemCode": "PHW",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Plazo Plain",
    "itemCode": "PPW",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Plazo Very Heavy",
    "itemCode": "PH",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Pyjama",
    "itemCode": "PY",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Salwar Heavy",
    "itemCode": "SLF",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Salwar Plain",
    "itemCode": "SPW",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Salwar Very Heavy",
    "itemCode": "SLH",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Saree Heavy",
    "itemCode": "SHY",
    "price": 340
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Saree Plain",
    "itemCode": "SRPW",
    "price": 230
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Saree Very Heavy",
    "itemCode": "SAH",
    "price": 440
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Scarf",
    "itemCode": "Sca",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Shawl Heavy",
    "itemCode": "SLHW",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Shawl Pashmina",
    "itemCode": "SHP",
    "price": 560
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Shawl Plain",
    "itemCode": "SHLP",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Shawl Very Heavy",
    "itemCode": "SWL",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Shirt",
    "itemCode": "Shi",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Long Heavy",
    "itemCode": "SLFW",
    "price": 220
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Long Plain",
    "itemCode": "SLPW",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Long Very Heavy",
    "itemCode": "SLTSO",
    "price": 290
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Short Heavy",
    "itemCode": "SSF",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Short Plain",
    "itemCode": "SS2",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Skirt Short Very Heavy",
    "itemCode": "SS3",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Slacks",
    "itemCode": "SLA",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Stocking",
    "itemCode": "sto",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Stole Heavy",
    "itemCode": "STF",
    "price": 120
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Stole Plain",
    "itemCode": "STPW",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Stole Very Heavy",
    "itemCode": "STH",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweat Shirt with Hood",
    "itemCode": "SWHM",
    "price": 490
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "SFFW",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPW",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "WSW",
    "price": 300
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPW",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Swimming Costume",
    "itemCode": "SCO",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "T Shirt",
    "itemCode": "T",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Top Heavy",
    "itemCode": "TPHW",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Top Plain",
    "itemCode": "TOPW",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Top Very Heavy",
    "itemCode": "THW",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Top Woollen",
    "itemCode": "TWW",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Track Pant",
    "itemCode": "Tpa",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Panty",
    "itemCode": "PNT",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Sweat Shirt",
    "itemCode": "SWX",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Puan",
    "itemCode": "PUN",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Burkha Plain",
    "itemCode": "BRP",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Burkha Heavy",
    "itemCode": "BRH",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Women",
    "name": "Burkha Very Heavy",
    "itemCode": "BVH",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Baby Blanket",
    "itemCode": "BB",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Blouse",
    "itemCode": "BK",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Blouse Heavy",
    "itemCode": "BHK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Capri",
    "itemCode": "CPK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Coat",
    "itemCode": "CK",
    "price": 160
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dangree",
    "itemCode": "DAK",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dress Heavy",
    "itemCode": "KDF",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dress long Plain",
    "itemCode": "DLPK",
    "price": 160
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dress Plain",
    "itemCode": "DRPK",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dress Very Heavy",
    "itemCode": "KDH",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dupatta",
    "itemCode": "DPK",
    "price": 50
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dupatta Heavy",
    "itemCode": "DHK",
    "price": 70
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Dupatta Very Heavy",
    "itemCode": "KDP",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Frock Heavy",
    "itemCode": "FF",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Frock Plain",
    "itemCode": "FPK",
    "price": 90
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Frock Very Heavy",
    "itemCode": "FH",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFK",
    "price": 160
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHSK",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Jacket with Hood",
    "itemCode": "JHH",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Jeans",
    "itemCode": "JeK",
    "price": 90
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Jumper",
    "itemCode": "JMP",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Kurta Plain",
    "itemCode": "KPLK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHK",
    "price": 180
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Leather Jacket",
    "itemCode": "LJK",
    "price": 320
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Leather Jacket Large",
    "itemCode": "LJL",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Legging",
    "itemCode": "LGK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Lehnga Heavy",
    "itemCode": "LFK",
    "price": 430
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Lehnga Plain",
    "itemCode": "LPK",
    "price": 320
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Long Coat",
    "itemCode": "LCK",
    "price": 240
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Long Pullover",
    "itemCode": "LPUK",
    "price": 300
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Pants",
    "itemCode": "PK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Salwar Heavy",
    "itemCode": "SFK",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Salwar Plain",
    "itemCode": "SPK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sherwani",
    "itemCode": "SHW",
    "price": 240
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Shirt",
    "itemCode": "SK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Shirt Woolen",
    "itemCode": "SWO",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Shorts",
    "itemCode": "SHK",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Skirt Heavy",
    "itemCode": "KSF",
    "price": 270
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Skirt Plain",
    "itemCode": "SPLK",
    "price": 220
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Skirt Very Heavy",
    "itemCode": "KSH",
    "price": 350
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweat Shirt",
    "itemCode": "ssh",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweat Shirt with Hood",
    "itemCode": "HK",
    "price": 300
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "KSW",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPK",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SSW",
    "price": 190
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPK",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Swimming Costume",
    "itemCode": "SCH",
    "price": 30
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "T Shirt",
    "itemCode": "TK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Top Heavy",
    "itemCode": "TFCK",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Top Plain",
    "itemCode": "TOPK",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Track Pant",
    "itemCode": "tpk",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Kids",
    "name": "Waist Coat",
    "itemCode": "wck",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Baby Blanket",
    "itemCode": "BB",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Blouse",
    "itemCode": "BK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Blouse Heavy",
    "itemCode": "BHK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Capri",
    "itemCode": "CPK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Coat",
    "itemCode": "CK",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dangree",
    "itemCode": "DAK",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dress Heavy",
    "itemCode": "KDF",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dress long Plain",
    "itemCode": "DLPK",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dress Plain",
    "itemCode": "DRPK",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dress Very Heavy",
    "itemCode": "KDH",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dupatta",
    "itemCode": "DPK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dupatta Heavy",
    "itemCode": "DHK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Dupatta Very Heavy",
    "itemCode": "KDP",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Frock Heavy",
    "itemCode": "FF",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Frock Plain",
    "itemCode": "FPK",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Frock Very Heavy",
    "itemCode": "FH",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFK",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHSK",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Jacket with Hood",
    "itemCode": "JHH",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Jeans",
    "itemCode": "JeK",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Jumper",
    "itemCode": "JMP",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Kurta Plain",
    "itemCode": "KPLK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHK",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Leather Jacket",
    "itemCode": "LJK",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Leather Jacket Large",
    "itemCode": "LJL",
    "price": 120
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Legging",
    "itemCode": "LGK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Lehnga Heavy",
    "itemCode": "LFK",
    "price": 130
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Lehnga Plain",
    "itemCode": "LPK",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Long Coat",
    "itemCode": "LCK",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Long Pullover",
    "itemCode": "LPUK",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Pants",
    "itemCode": "PK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Salwar Heavy",
    "itemCode": "SFK",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Salwar Plain",
    "itemCode": "SPK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sherwani",
    "itemCode": "SHW",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Shirt",
    "itemCode": "SK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Shirt Woolen",
    "itemCode": "SWO",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Shorts",
    "itemCode": "SHK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Skirt Heavy",
    "itemCode": "KSF",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Skirt Plain",
    "itemCode": "SPLK",
    "price": 70
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Skirt Very Heavy",
    "itemCode": "KSH",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweat Shirt",
    "itemCode": "ssh",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweat Shirt with Hood",
    "itemCode": "HK",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "KSW",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPK",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SSW",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPK",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Swimming Costume",
    "itemCode": "SCH",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "T Shirt",
    "itemCode": "TK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Top Heavy",
    "itemCode": "TFCK",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Top Plain",
    "itemCode": "TOPK",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Track Pant",
    "itemCode": "tpk",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Kids",
    "name": "Waist Coat",
    "itemCode": "wck",
    "price": 20
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Baby Blanket",
    "itemCode": "BB",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Blouse",
    "itemCode": "BK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Blouse Heavy",
    "itemCode": "BHK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Capri",
    "itemCode": "CPK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Coat",
    "itemCode": "CK",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dangree",
    "itemCode": "DAK",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dress Heavy",
    "itemCode": "KDF",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dress long Plain",
    "itemCode": "DLPK",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dress Plain",
    "itemCode": "DRPK",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dress Very Heavy",
    "itemCode": "KDH",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dupatta",
    "itemCode": "DPK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dupatta Heavy",
    "itemCode": "DHK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Dupatta Very Heavy",
    "itemCode": "KDP",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Frock Heavy",
    "itemCode": "FF",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Frock Plain",
    "itemCode": "FPK",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Frock Very Heavy",
    "itemCode": "FH",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFK",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHSK",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Jacket with Hood",
    "itemCode": "JHH",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Jeans",
    "itemCode": "JeK",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Jumper",
    "itemCode": "JMP",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Kurta Plain",
    "itemCode": "KPLK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHK",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Leather Jacket",
    "itemCode": "LJK",
    "price": 130
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Leather Jacket Large",
    "itemCode": "LJL",
    "price": 160
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Legging",
    "itemCode": "LGK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Lehnga Heavy",
    "itemCode": "LFK",
    "price": 170
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Lehnga Plain",
    "itemCode": "LPK",
    "price": 130
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Long Coat",
    "itemCode": "LCK",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Long Pullover",
    "itemCode": "LPUK",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Pants",
    "itemCode": "PK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Salwar Heavy",
    "itemCode": "SFK",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Salwar Plain",
    "itemCode": "SPK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sherwani",
    "itemCode": "SHW",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Shirt",
    "itemCode": "SK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Shirt Woolen",
    "itemCode": "SWO",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Shorts",
    "itemCode": "SHK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Skirt Heavy",
    "itemCode": "KSF",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Skirt Plain",
    "itemCode": "SPLK",
    "price": 90
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Skirt Very Heavy",
    "itemCode": "KSH",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweat Shirt",
    "itemCode": "ssh",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweat Shirt with Hood",
    "itemCode": "HK",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "KSW",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPK",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SSW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPK",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Swimming Costume",
    "itemCode": "SCH",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "T Shirt",
    "itemCode": "TK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Top Heavy",
    "itemCode": "TFCK",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Top Plain",
    "itemCode": "TOPK",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Track Pant",
    "itemCode": "tpk",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Kids",
    "name": "Waist Coat",
    "itemCode": "wck",
    "price": 30
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Baby Blanket",
    "itemCode": "BB",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Blouse",
    "itemCode": "BK",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Blouse Heavy",
    "itemCode": "BHK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Capri",
    "itemCode": "CPK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Coat",
    "itemCode": "CK",
    "price": 210
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dangree",
    "itemCode": "DAK",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dress Heavy",
    "itemCode": "KDF",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dress long Plain",
    "itemCode": "DLPK",
    "price": 210
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dress Plain",
    "itemCode": "DRPK",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dress Very Heavy",
    "itemCode": "KDH",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dupatta",
    "itemCode": "DPK",
    "price": 70
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dupatta Heavy",
    "itemCode": "DHK",
    "price": 90
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Dupatta Very Heavy",
    "itemCode": "KDP",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Frock Heavy",
    "itemCode": "FF",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Frock Plain",
    "itemCode": "FPK",
    "price": 120
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Frock Very Heavy",
    "itemCode": "FH",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Jacket Full Sleeves",
    "itemCode": "JFK",
    "price": 210
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Jacket Half Sleeves",
    "itemCode": "JHSK",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Jacket with Hood",
    "itemCode": "JHH",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Jeans",
    "itemCode": "JeK",
    "price": 120
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Jumper",
    "itemCode": "JMP",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Kurta Plain",
    "itemCode": "KPLK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Kurta Very Heavy",
    "itemCode": "KVHK",
    "price": 230
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Leather Jacket",
    "itemCode": "LJK",
    "price": 420
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Leather Jacket Large",
    "itemCode": "LJL",
    "price": 520
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Legging",
    "itemCode": "LGK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Lehnga Heavy",
    "itemCode": "LFK",
    "price": 560
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Lehnga Plain",
    "itemCode": "LPK",
    "price": 420
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Long Coat",
    "itemCode": "LCK",
    "price": 310
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Long Pullover",
    "itemCode": "LPUK",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Pants",
    "itemCode": "PK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Salwar Heavy",
    "itemCode": "SFK",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Salwar Plain",
    "itemCode": "SPK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sherwani",
    "itemCode": "SHW",
    "price": 310
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Shirt",
    "itemCode": "SK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Shirt Woolen",
    "itemCode": "SWO",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Shorts",
    "itemCode": "SHK",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Skirt Heavy",
    "itemCode": "KSF",
    "price": 350
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Skirt Plain",
    "itemCode": "SPLK",
    "price": 290
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Skirt Very Heavy",
    "itemCode": "KSH",
    "price": 460
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweat Shirt",
    "itemCode": "ssh",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweat Shirt with Hood",
    "itemCode": "HK",
    "price": 390
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweater Full Sleeves Heavy",
    "itemCode": "KSW",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweater Full Sleeves Plain",
    "itemCode": "SFPK",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweater Half Sleeves Heavy",
    "itemCode": "SSW",
    "price": 250
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Sweater Half Sleeves Plain",
    "itemCode": "SHPK",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Swimming Costume",
    "itemCode": "SCH",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "T Shirt",
    "itemCode": "TK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Top Heavy",
    "itemCode": "TFCK",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Top Plain",
    "itemCode": "TOPK",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Track Pant",
    "itemCode": "tpk",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Kids",
    "name": "Waist Coat",
    "itemCode": "wck",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Bed Head",
    "itemCode": "BEH",
    "price": 1500
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Bed Sheet Double",
    "itemCode": "BSD",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Bed Sheet Single",
    "itemCode": "BSS",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Bed Spread Double",
    "itemCode": "BSPDD",
    "price": 270
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Bed Spread Single",
    "itemCode": "BSPS",
    "price": 180
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blanket Double",
    "itemCode": "BD",
    "price": 350
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blanket Double 2 Ply",
    "itemCode": "BD2",
    "price": 440
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blanket Single",
    "itemCode": "BS",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blanket Single 2 Ply",
    "itemCode": "BS2",
    "price": 310
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blind Door",
    "itemCode": "BLD",
    "price": 260
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Blind Window",
    "itemCode": "BW",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Carpet",
    "itemCode": "carp",
    "price": 30
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Chair Covers",
    "itemCode": "CCO",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Curtain Belt",
    "itemCode": "CBL",
    "price": 50
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Curtain Door",
    "itemCode": "CD",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Curtain Door With Lining",
    "itemCode": "CDL",
    "price": 260
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Curtain Window",
    "itemCode": "CW",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Curtain Window With Lining",
    "itemCode": "CWL",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Covers",
    "itemCode": "CUC",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Covers Large",
    "itemCode": "CCL",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Covers Medium",
    "itemCode": "CCM",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Large",
    "itemCode": "CSHL",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Medium",
    "itemCode": "CSHM",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Cushion Small",
    "itemCode": "CSHS",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Duvet",
    "itemCode": "DUV",
    "price": 70
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Duvet Double",
    "itemCode": "DD",
    "price": 110
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Foot Mats",
    "itemCode": "FMA",
    "price": 50
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Hand Towel",
    "itemCode": "HTO",
    "price": 30
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Mattress Double",
    "itemCode": "MTD",
    "price": 1800
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Mattress Single",
    "itemCode": "MTS",
    "price": 900
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Pillow Covers",
    "itemCode": "Pco",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Quilt Cover Double",
    "itemCode": "QCD",
    "price": 270
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Quilt Cover Single",
    "itemCode": "QCS",
    "price": 180
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Quilt Double",
    "itemCode": "QDH",
    "price": 350
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Quilt Single",
    "itemCode": "QSH",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Quilt Very Heavy",
    "itemCode": "QVH",
    "price": 440
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Sofa Cover Large",
    "itemCode": "SCL",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Sofa Cover Medium",
    "itemCode": "SCM",
    "price": 80
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Sofa Cover Small",
    "itemCode": "SCS",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Table Cloth Large",
    "itemCode": "TCL",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Table Cloth Small",
    "itemCode": "TCS",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Table Mat",
    "itemCode": "TM",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Household",
    "name": "Towel Large",
    "itemCode": "TL",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Bed Head",
    "itemCode": "BEH",
    "price": 450
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Bed Sheet Double",
    "itemCode": "BSD",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Bed Sheet Single",
    "itemCode": "BSS",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Bed Spread Double",
    "itemCode": "BSPDD",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Bed Spread Single",
    "itemCode": "BSPS",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blanket Double",
    "itemCode": "BD",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blanket Double 2 Ply",
    "itemCode": "BD2",
    "price": 130
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blanket Single",
    "itemCode": "BS",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blanket Single 2 Ply",
    "itemCode": "BS2",
    "price": 90
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blind Door",
    "itemCode": "BLD",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Blind Window",
    "itemCode": "BW",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Carpet",
    "itemCode": "carp",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Chair Covers",
    "itemCode": "CCO",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Curtain Belt",
    "itemCode": "CBL",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Curtain Door",
    "itemCode": "CD",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Curtain Door With Lining",
    "itemCode": "CDL",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Curtain Window",
    "itemCode": "CW",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Curtain Window With Lining",
    "itemCode": "CWL",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Covers",
    "itemCode": "CUC",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Covers Large",
    "itemCode": "CCL",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Covers Medium",
    "itemCode": "CCM",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Large",
    "itemCode": "CSHL",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Medium",
    "itemCode": "CSHM",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Cushion Small",
    "itemCode": "CSHS",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Duvet",
    "itemCode": "DUV",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Duvet Double",
    "itemCode": "DD",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Foot Mats",
    "itemCode": "FMA",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Hand Towel",
    "itemCode": "HTO",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Mattress Double",
    "itemCode": "MTD",
    "price": 540
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Mattress Single",
    "itemCode": "MTS",
    "price": 270
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Pillow Covers",
    "itemCode": "Pco",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Quilt Cover Double",
    "itemCode": "QCD",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Quilt Cover Single",
    "itemCode": "QCS",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Quilt Double",
    "itemCode": "QDH",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Quilt Single",
    "itemCode": "QSH",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Quilt Very Heavy",
    "itemCode": "QVH",
    "price": 130
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Sofa Cover Large",
    "itemCode": "SCL",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Sofa Cover Medium",
    "itemCode": "SCM",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Sofa Cover Small",
    "itemCode": "SCS",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Table Cloth Large",
    "itemCode": "TCL",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Table Cloth Small",
    "itemCode": "TCS",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Table Mat",
    "itemCode": "TM",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Household",
    "name": "Towel Large",
    "itemCode": "TL",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Bed Head",
    "itemCode": "BEH",
    "price": 590
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Bed Sheet Double",
    "itemCode": "BSD",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Bed Sheet Single",
    "itemCode": "BSS",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Bed Spread Double",
    "itemCode": "BSPDD",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Bed Spread Single",
    "itemCode": "BSPS",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blanket Double",
    "itemCode": "BD",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blanket Double 2 Ply",
    "itemCode": "BD2",
    "price": 170
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blanket Single",
    "itemCode": "BS",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blanket Single 2 Ply",
    "itemCode": "BS2",
    "price": 120
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blind Door",
    "itemCode": "BLD",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Blind Window",
    "itemCode": "BW",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Carpet",
    "itemCode": "carp",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Chair Covers",
    "itemCode": "CCO",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Curtain Belt",
    "itemCode": "CBL",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Curtain Door",
    "itemCode": "CD",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Curtain Door With Lining",
    "itemCode": "CDL",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Curtain Window",
    "itemCode": "CW",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Curtain Window With Lining",
    "itemCode": "CWL",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Covers",
    "itemCode": "CUC",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Covers Large",
    "itemCode": "CCL",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Covers Medium",
    "itemCode": "CCM",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Large",
    "itemCode": "CSHL",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Medium",
    "itemCode": "CSHM",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Cushion Small",
    "itemCode": "CSHS",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Duvet",
    "itemCode": "DUV",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Duvet Double",
    "itemCode": "DD",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Foot Mats",
    "itemCode": "FMA",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Hand Towel",
    "itemCode": "HTO",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Mattress Double",
    "itemCode": "MTD",
    "price": 700
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Mattress Single",
    "itemCode": "MTS",
    "price": 350
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Pillow Covers",
    "itemCode": "Pco",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Quilt Cover Double",
    "itemCode": "QCD",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Quilt Cover Single",
    "itemCode": "QCS",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Quilt Double",
    "itemCode": "QDH",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Quilt Single",
    "itemCode": "QSH",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Quilt Very Heavy",
    "itemCode": "QVH",
    "price": 170
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Sofa Cover Large",
    "itemCode": "SCL",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Sofa Cover Medium",
    "itemCode": "SCM",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Sofa Cover Small",
    "itemCode": "SCS",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Table Cloth Large",
    "itemCode": "TCL",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Table Cloth Small",
    "itemCode": "TCS",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Table Mat",
    "itemCode": "TM",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Household",
    "name": "Towel Large",
    "itemCode": "TL",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Bed Head",
    "itemCode": "BEH",
    "price": 1950
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Bed Sheet Double",
    "itemCode": "BSD",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Bed Sheet Single",
    "itemCode": "BSS",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Bed Spread Double",
    "itemCode": "BSPDD",
    "price": 350
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Bed Spread Single",
    "itemCode": "BSPS",
    "price": 230
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blanket Double",
    "itemCode": "BD",
    "price": 460
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blanket Double 2 Ply",
    "itemCode": "BD2",
    "price": 570
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blanket Single",
    "itemCode": "BS",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blanket Single 2 Ply",
    "itemCode": "BS2",
    "price": 400
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blind Door",
    "itemCode": "BLD",
    "price": 340
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Blind Window",
    "itemCode": "BW",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Carpet",
    "itemCode": "carp",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Chair Covers",
    "itemCode": "CCO",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Curtain Belt",
    "itemCode": "CBL",
    "price": 70
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Curtain Door",
    "itemCode": "CD",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Curtain Door With Lining",
    "itemCode": "CDL",
    "price": 340
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Curtain Window",
    "itemCode": "CW",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Curtain Window With Lining",
    "itemCode": "CWL",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Covers",
    "itemCode": "CUC",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Covers Large",
    "itemCode": "CCL",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Covers Medium",
    "itemCode": "CCM",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Large",
    "itemCode": "CSHL",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Medium",
    "itemCode": "CSHM",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Cushion Small",
    "itemCode": "CSHS",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Duvet",
    "itemCode": "DUV",
    "price": 90
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Duvet Double",
    "itemCode": "DD",
    "price": 140
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Foot Mats",
    "itemCode": "FMA",
    "price": 70
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Hand Towel",
    "itemCode": "HTO",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Mattress Double",
    "itemCode": "MTD",
    "price": 2340
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Mattress Single",
    "itemCode": "MTS",
    "price": 1170
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Pillow Covers",
    "itemCode": "Pco",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Quilt Cover Double",
    "itemCode": "QCD",
    "price": 350
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Quilt Cover Single",
    "itemCode": "QCS",
    "price": 230
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Quilt Double",
    "itemCode": "QDH",
    "price": 460
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Quilt Single",
    "itemCode": "QSH",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Quilt Very Heavy",
    "itemCode": "QVH",
    "price": 570
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Sofa Cover Large",
    "itemCode": "SCL",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Sofa Cover Medium",
    "itemCode": "SCM",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Sofa Cover Small",
    "itemCode": "SCS",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Table Cloth Large",
    "itemCode": "TCL",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Table Cloth Small",
    "itemCode": "TCS",
    "price": 80
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Table Mat",
    "itemCode": "TM",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Household",
    "name": "Towel Large",
    "itemCode": "TL",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Bath Robe",
    "itemCode": "BR",
    "price": 130
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Belt",
    "itemCode": "BE",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Cap",
    "itemCode": "CP",
    "price": 160
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Car Seat Cover",
    "itemCode": "CSC",
    "price": 150
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Doctor Apron",
    "itemCode": "DOC",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Face Mask",
    "itemCode": "FMS",
    "price": 50
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Gloves Left",
    "itemCode": "GLL",
    "price": 25
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Gloves Right",
    "itemCode": "GLR",
    "price": 25
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Large",
    "itemCode": "HBL",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Small",
    "itemCode": "HBS",
    "price": 280
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Handbag Leather Large",
    "itemCode": "HLL",
    "price": 600
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Handbag Leather Small",
    "itemCode": "HLS",
    "price": 400
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Handkerchief",
    "itemCode": "Ha",
    "price": 30
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Hat",
    "itemCode": "H",
    "price": 160
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Joyson Airbag Fabric",
    "itemCode": "JAF",
    "price": 0
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Joyson Reusable Gown",
    "itemCode": "JRG",
    "price": 0
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Lawyer Gown",
    "itemCode": "LWG",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Lawyer Gown Woolen",
    "itemCode": "LGW",
    "price": 260
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Muffler",
    "itemCode": "MF",
    "price": 120
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Rain Coat",
    "itemCode": "RC",
    "price": 140
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Seat Cover",
    "itemCode": "SEC",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Socks Left",
    "itemCode": "SOL",
    "price": 25
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Socks Right",
    "itemCode": "SOR",
    "price": 25
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Soft Toy Extra Large",
    "itemCode": "STEL",
    "price": 600
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Soft Toy Full Size",
    "itemCode": "STFS",
    "price": 780
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Soft Toy Large",
    "itemCode": "STL",
    "price": 460
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Soft Toy Medium",
    "itemCode": "STM",
    "price": 330
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Soft Toy Small",
    "itemCode": "STSM",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Suit Case Extra Large",
    "itemCode": "SCEL",
    "price": 680
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Suit Case Large",
    "itemCode": "SCSL",
    "price": 530
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Suit Case Medium",
    "itemCode": "SCSM",
    "price": 380
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Suit Case Small",
    "itemCode": "SCSS",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Tie",
    "itemCode": "TIE",
    "price": 40
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Wallet",
    "itemCode": "WLT",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Apron",
    "itemCode": "APR",
    "price": 100
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Chef Coat",
    "itemCode": "CCT",
    "price": 200
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Backpack Small",
    "itemCode": "BPS",
    "price": 250
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Backpack Medium",
    "itemCode": "BPM",
    "price": 375
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Backpack Large",
    "itemCode": "BPL",
    "price": 525
  },
  {
    "service": "Dry Clean",
    "category": "Others",
    "name": "Mosquito Net",
    "itemCode": "MNT",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Bath Robe",
    "itemCode": "BR",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Belt",
    "itemCode": "BE",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Cap",
    "itemCode": "CP",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Car Seat Cover",
    "itemCode": "CSC",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Doctor Apron",
    "itemCode": "DOC",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Face Mask",
    "itemCode": "FMS",
    "price": 20
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Gloves Left",
    "itemCode": "GLL",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Gloves Right",
    "itemCode": "GLR",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Large",
    "itemCode": "HBL",
    "price": 120
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Small",
    "itemCode": "HBS",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Handbag Leather Large",
    "itemCode": "HLL",
    "price": 180
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Handbag Leather Small",
    "itemCode": "HLS",
    "price": 120
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Handkerchief",
    "itemCode": "Ha",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Hat",
    "itemCode": "H",
    "price": 50
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Joyson Airbag Fabric",
    "itemCode": "JAF",
    "price": 0
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Joyson Reusable Gown",
    "itemCode": "JRG",
    "price": 0
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Lawyer Gown",
    "itemCode": "LWG",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Lawyer Gown Woolen",
    "itemCode": "LGW",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Muffler",
    "itemCode": "MF",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Rain Coat",
    "itemCode": "RC",
    "price": 40
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Seat Cover",
    "itemCode": "SEC",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Socks Left",
    "itemCode": "SOL",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Socks Right",
    "itemCode": "SOR",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Soft Toy Extra Large",
    "itemCode": "STEL",
    "price": 180
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Soft Toy Full Size",
    "itemCode": "STFS",
    "price": 230
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Soft Toy Large",
    "itemCode": "STL",
    "price": 140
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Soft Toy Medium",
    "itemCode": "STM",
    "price": 100
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Soft Toy Small",
    "itemCode": "STSM",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Suit Case Extra Large",
    "itemCode": "SCEL",
    "price": 200
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Suit Case Large",
    "itemCode": "SCSL",
    "price": 160
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Suit Case Medium",
    "itemCode": "SCSM",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Suit Case Small",
    "itemCode": "SCSS",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Tie",
    "itemCode": "TIE",
    "price": 10
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Wallet",
    "itemCode": "WLT",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Apron",
    "itemCode": "APR",
    "price": 30
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Chef Coat",
    "itemCode": "CCT",
    "price": 60
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Backpack Small",
    "itemCode": "BPS",
    "price": 80
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Backpack Medium",
    "itemCode": "BPM",
    "price": 110
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Backpack Large",
    "itemCode": "BPL",
    "price": 160
  },
  {
    "service": "Steam Iron",
    "category": "Others",
    "name": "Mosquito Net",
    "itemCode": "MNT",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Bath Robe",
    "itemCode": "BR",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Belt",
    "itemCode": "BE",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Cap",
    "itemCode": "CP",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Car Seat Cover",
    "itemCode": "CSC",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Doctor Apron",
    "itemCode": "DOC",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Face Mask",
    "itemCode": "FMS",
    "price": 30
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Gloves Left",
    "itemCode": "GLL",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Gloves Right",
    "itemCode": "GLR",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Large",
    "itemCode": "HBL",
    "price": 160
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Small",
    "itemCode": "HBS",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Handbag Leather Large",
    "itemCode": "HLL",
    "price": 230
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Handbag Leather Small",
    "itemCode": "HLS",
    "price": 160
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Handkerchief",
    "itemCode": "Ha",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Hat",
    "itemCode": "H",
    "price": 70
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Joyson Airbag Fabric",
    "itemCode": "JAF",
    "price": 0
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Joyson Reusable Gown",
    "itemCode": "JRG",
    "price": 0
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Lawyer Gown",
    "itemCode": "LWG",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Lawyer Gown Woolen",
    "itemCode": "LGW",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Muffler",
    "itemCode": "MF",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Rain Coat",
    "itemCode": "RC",
    "price": 50
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Seat Cover",
    "itemCode": "SEC",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Socks Left",
    "itemCode": "SOL",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Socks Right",
    "itemCode": "SOR",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Soft Toy Extra Large",
    "itemCode": "STEL",
    "price": 230
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Soft Toy Full Size",
    "itemCode": "STFS",
    "price": 300
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Soft Toy Large",
    "itemCode": "STL",
    "price": 180
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Soft Toy Medium",
    "itemCode": "STM",
    "price": 130
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Soft Toy Small",
    "itemCode": "STSM",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Suit Case Extra Large",
    "itemCode": "SCEL",
    "price": 260
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Suit Case Large",
    "itemCode": "SCSL",
    "price": 210
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Suit Case Medium",
    "itemCode": "SCSM",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Suit Case Small",
    "itemCode": "SCSS",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Tie",
    "itemCode": "TIE",
    "price": 10
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Wallet",
    "itemCode": "WLT",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Apron",
    "itemCode": "APR",
    "price": 40
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Chef Coat",
    "itemCode": "CCT",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Backpack Small",
    "itemCode": "BPS",
    "price": 100
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Backpack Medium",
    "itemCode": "BPM",
    "price": 140
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Backpack Large",
    "itemCode": "BPL",
    "price": 210
  },
  {
    "service": "Starching",
    "category": "Others",
    "name": "Mosquito Net",
    "itemCode": "MNT",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Bath Robe",
    "itemCode": "BR",
    "price": 170
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Belt",
    "itemCode": "BE",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Cap",
    "itemCode": "CP",
    "price": 210
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Car Seat Cover",
    "itemCode": "CSC",
    "price": 200
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Doctor Apron",
    "itemCode": "DOC",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Face Mask",
    "itemCode": "FMS",
    "price": 70
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Gloves Left",
    "itemCode": "GLL",
    "price": 30
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Gloves Right",
    "itemCode": "GLR",
    "price": 30
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Large",
    "itemCode": "HBL",
    "price": 520
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Handbag Canvass Jute Cloth based Small",
    "itemCode": "HBS",
    "price": 360
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Handbag Leather Large",
    "itemCode": "HLL",
    "price": 780
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Handbag Leather Small",
    "itemCode": "HLS",
    "price": 520
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Handkerchief",
    "itemCode": "Ha",
    "price": 40
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Hat",
    "itemCode": "H",
    "price": 210
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Joyson Airbag Fabric",
    "itemCode": "JAF",
    "price": 0
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Joyson Reusable Gown",
    "itemCode": "JRG",
    "price": 0
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Lawyer Gown",
    "itemCode": "LWG",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Lawyer Gown Woolen",
    "itemCode": "LGW",
    "price": 340
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Muffler",
    "itemCode": "MF",
    "price": 160
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Rain Coat",
    "itemCode": "RC",
    "price": 180
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Seat Cover",
    "itemCode": "SEC",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Socks Left",
    "itemCode": "SOL",
    "price": 30
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Socks Right",
    "itemCode": "SOR",
    "price": 30
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Soft Toy Extra Large",
    "itemCode": "STEL",
    "price": 780
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Soft Toy Full Size",
    "itemCode": "STFS",
    "price": 1010
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Soft Toy Large",
    "itemCode": "STL",
    "price": 600
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Soft Toy Medium",
    "itemCode": "STM",
    "price": 430
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Soft Toy Small",
    "itemCode": "STSM",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Suit Case Extra Large",
    "itemCode": "SCEL",
    "price": 880
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Suit Case Large",
    "itemCode": "SCSL",
    "price": 690
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Suit Case Medium",
    "itemCode": "SCSM",
    "price": 490
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Suit Case Small",
    "itemCode": "SCSS",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Tie",
    "itemCode": "TIE",
    "price": 50
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Wallet",
    "itemCode": "WLT",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Apron",
    "itemCode": "APR",
    "price": 130
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Chef Coat",
    "itemCode": "CCT",
    "price": 260
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Backpack Small",
    "itemCode": "BPS",
    "price": 330
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Backpack Medium",
    "itemCode": "BPM",
    "price": 490
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Backpack Large",
    "itemCode": "BPL",
    "price": 680
  },
  {
    "service": "Starching DC",
    "category": "Others",
    "name": "Mosquito Net",
    "itemCode": "MNT",
    "price": 130
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Ankle Length Boots Left",
    "itemCode": "ALB",
    "price": 280
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Ankle Length Boots Right",
    "itemCode": "ALR",
    "price": 280
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Mid Length Boot Left",
    "itemCode": "MLB",
    "price": 410
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Mid Length Boot Right",
    "itemCode": "MBR",
    "price": 410
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Knee Length Boot Left",
    "itemCode": "KBL",
    "price": 570
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Knee Length Boot Right",
    "itemCode": "KBR",
    "price": 570
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Sport Shoes Left",
    "itemCode": "SSL",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Sport Shoes Right",
    "itemCode": "SSR",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Canvass Shoes Left",
    "itemCode": "CSL",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Canvass Shoes Right",
    "itemCode": "CSR",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Leather Shoes Left",
    "itemCode": "LSL",
    "price": 200
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Leather Shoes Right",
    "itemCode": "LSR",
    "price": 200
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Suede Leather Shoes Left",
    "itemCode": "SUL",
    "price": 250
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Suede Leather Shoes Right",
    "itemCode": "SUR",
    "price": 250
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Sandals Left",
    "itemCode": "SDL",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Sandals Right",
    "itemCode": "SDR",
    "price": 80
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Slippers Left",
    "itemCode": "SIL",
    "price": 60
  },
  {
    "service": "Shoe Cleaning",
    "category": "Shoes",
    "name": "Slippers Right",
    "itemCode": "SIR",
    "price": 60
  },
  {
    "service": "Dry Clean",
    "category": "Institutional",
    "name": "School Bag",
    "itemCode": "SCHLBG",
    "price": 280
  },
  {
    "service": "Steam Iron",
    "category": "Institutional",
    "name": "School Bag",
    "itemCode": "SCHLBG",
    "price": 80
  },
  {
    "service": "Starching",
    "category": "Institutional",
    "name": "School Bag",
    "itemCode": "SCHLBG",
    "price": 100
  },
  {
    "service": "Starching DC",
    "category": "Institutional",
    "name": "School Bag",
    "itemCode": "SCHLBG",
    "price": 360
  },
  {
    "service": "Shoe Cleaning",
    "category": "Institutional",
    "name": "School Bag",
    "itemCode": "SCHLBG",
    "price": 0
  },
  {
    "service": "Laundry",
    "category": "Common",
    "name": "Wash & Steam Iron",
    "itemCode": "WSI",
    "price": 115
  },
  {
    "service": "Laundry",
    "category": "Common",
    "name": "Wash & Fold",
    "itemCode": "WF",
    "price": 70
  },
  {
    "service": "Laundry",
    "category": "Common",
    "name": "Premium Laundry",
    "itemCode": "PL",
    "price": 175
  },
  {
    "service": "Laundry",
    "category": "Common",
    "name": "Woolen Laundry(W&SI)",
    "itemCode": "WLS",
    "price": 175
  },
  {
    "service": "Laundry",
    "category": "Common",
    "name": "Woolen Laundry(W&F)",
    "itemCode": "WLW",
    "price": 150
  }
];

export const pdfGarmentCatalog: GarmentMaster[] = rawPdfPriceList.map((item, index) => {
  const serviceCode = 
    item.service.toLowerCase().includes('dry clean') ? 'DC' :
    item.service.toLowerCase().includes('steam') ? 'SP' :
    item.service.toLowerCase().includes('starching dc') ? 'ST' :
    item.service.toLowerCase().includes('starching') ? 'ST' :
    item.service.toLowerCase().includes('shoe') ? 'SC' :
    item.service.toLowerCase().includes('laundry') ? 'LD' : 'DC';

  const categoryUpper = item.category.toUpperCase();

  const iconName = 
    item.name.toLowerCase().includes('shirt') && !item.name.toLowerCase().includes('sweat') && !item.name.toLowerCase().includes('t shirt') ? 'shirt' :
    item.name.toLowerCase().includes('t shirt') || item.name.toLowerCase().includes('t-shirt') ? 'tshirt' :
    item.name.toLowerCase().includes('jeans') ? 'jeans' :
    item.name.toLowerCase().includes('pant') || item.name.toLowerCase().includes('pyjama') || item.name.toLowerCase().includes('salwar') ? 'pants' :
    item.name.toLowerCase().includes('coat') || item.name.toLowerCase().includes('achkan') || item.name.toLowerCase().includes('sherwani') ? 'coat' :
    item.name.toLowerCase().includes('jacket') ? 'jacket' :
    item.name.toLowerCase().includes('kurta') ? 'kurta' :
    item.name.toLowerCase().includes('blouse') ? 'blouse' :
    item.name.toLowerCase().includes('saree') ? 'saree' :
    item.name.toLowerCase().includes('lehnga') ? 'lehenga' :
    item.name.toLowerCase().includes('dress') || item.name.toLowerCase().includes('frock') ? 'dress' :
    item.name.toLowerCase().includes('blanket') || item.name.toLowerCase().includes('quilt') ? 'blanket' :
    item.name.toLowerCase().includes('sheet') ? 'bedsheet_double' :
    item.name.toLowerCase().includes('shoe') || item.name.toLowerCase().includes('boot') || item.name.toLowerCase().includes('slipper') ? 'shoes' :
    item.name.toLowerCase().includes('bag') ? 'bag' :
    item.name.toLowerCase().includes('toy') ? 'soft_toy' : 'shirt';

  return {
    id: `pdf-${index + 1}-${item.itemCode.toLowerCase()}-${item.service.replace(/\s+/g, '-').toLowerCase()}`,
    code: item.itemCode,
    itemCode: item.itemCode,
    name: item.name,
    service: item.service,
    serviceCode: serviceCode,
    category: categoryUpper as GarmentCategory,
    defaultPrice: item.price,
    price: item.price,
    icon: iconName
  };
});
