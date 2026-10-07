import fs from 'fs';
import path from 'path';

const downloads = [
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1ULKqigNcrfqeeTCD-kJNzzuWSHcRFoOuhQ9Nmn2iShzbStimwCYOmSVPLk-xxeOipMgG6xB-9A6qMPZQ6TYTzfYJwH1-EH7h75CAP8lz5gD6GI9F7Caxg7JeXk7tGLHowYykxrc8W_L4QkgnqLS2ADfKzGl4d62z3ZmRwanhUdBClQYGFtbxQe6mfimdnQEKj6T-8TiePpNxZ3Ab7zRk2mECiyyb0RtDXvuiT8SrKpIhqIbHCxXKCcWUw', path: 'assets/stitch_screens/01_home.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1Xv10xCs7O_iJ4BrTMAdoI-x-jbkH3QqXQ8tJQqlDJsVOnbiXARwyOUTxtC49kxKDUgNHib818kU1GXURrhfqVTaHje1tqXjNlOggWc741H0VwJqHn-O28LvE5etbObKfkGD47uQ05inV-NgkILAZdH70BqCIuGGCYoejr_O9Ao6S8h82WwL_5i92YNkSPjSCkFMXbI8Q2D7-TtKfZuKR4BniDzgCaciDPZ70GqcviETxO_ssZrc1VCnWA', path: 'assets/stitch_screens/02_travel.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1UbPKtlooBbxohbk8NsZYvC1eAeseZsJkJGF87uksbtElAVX1DZIsYWsimim1JKIx-SAFA5geFLXAaCIL_QI55NMcluQ4SR-wApMd8h5dA6sqcllVcCfZ7D2jWZMieCawYlE2EB3XLp0BUJdgDOUzpAhJfkU70iHU34wJJCttBWEsMaDYCw-01uRhjxlbNSplYscFEBia5J7wEJyyPrNga4qMD9jYteGFBYgKdbaw3VXRrA4SiH1erp3eY', path: 'assets/stitch_screens/03_travel_detail.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1WP2ef1QdW4mmDQ7o2fhlSy02YroUdWX0GlW3N0idN63OzwJ6YoHE-7YfXJCYNXyAtg6IpVfrHCpZYcmFKsDERNkNWAST_uW6-6OFq2kMNBRjEdlk6BAE8cob0G0H3t5S6pONCaQlsr6vep9Mw_MJepzRR4Nz5xwl-4lK23Cbm9WtJAbCmld6Tkxpr3vAKm6RPW_oBye6UPawf3BRuBa2cma0yT7AYQbYoo93pqG3-0USNHwwj71oBUJw', path: 'assets/stitch_screens/04_dining.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1Vfz2RWfbxMvdklwom4pyMgzC2hWHtH0HSKmL7xb9pm0CQ9Ph9TYjKbPe9IYRZcWJamV-bvqEQoY1RtQChJmZFHVFw0EwJTPUmAh4AghpL_4qBtDVBE_cS0eGdPMiXKHTmpABKOiAHvGCV3ZBQm7qJbFIkFzCj4tZfF4ckL_P-Pk9SVbzGnPQx-J5jiEqv8DzqAjeCCYXs_s-gUAE0fk90VGgTXYfLqOXB0SzRoTiLWtJuM7cXS1Wz69OA', path: 'assets/stitch_screens/05_meal_subscription.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1X86aE3wI9jDYEuxF2loDg-0HQoolf8vMSbF5Z3VEtl1yfQcSDYVZUlx6B-tujFW5kXHiXK001mpNmkE0ficHjsmtNEqfuoDVoU9eyQ2mDVdKMeNdoBVHaj6UeM7b1XGXtv6qDLZSDju16g-fhoZLst1dMKKFciQWRbdSYFKLAgCcKgzAXDMe6leUUgHCSoXt0Y2I_X6m3jT6Fhgytw0YUL3uHN_33ZwdzTkDZ2-qWbgqICL_FqFWWlJOs', path: 'assets/stitch_screens/06_lounge.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1X433ZKzkqTyL3C1taWM54_hrjAWhHCNnyaFiOsrq66EYclWDTfDqKrQBT1w352u-lz7I7lCdT10ATzTEgoft6plWhcVKXPymz5dPeD3iexvncPXW9l-yI_XrtegTYL2TGRNBxXb1w1SZvHnlOMHZhjkhV05qQuPxCuLW2PrY7VGh23wz3gDYGJrSkM8k-_en-RcSuZDM04YPeMHNleGiAfv8woOU1qgVMAlIR56PjRfK8l3cA_1geMKA', path: 'assets/stitch_screens/07_voice_search.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1VyO8gg9Wy2TmXgSewTCgUY-0a91WmfcsUzq8lK7z2c4MFkPnm6VpJfQaYvK983l-cc5SMT-OjzH8S5bixipwTziLLq5ns6kTcR0bqAnMP3xelua4UrNO3hB20qfi1LQbK07t-vteM5ZOpGRbCn5IyXa_K9E1UIdlvbDfbRz4wTNbUxJVRgT6N8STMzLgUmzd7YEaa9FUkgxtnVXcL0NTI_XH75Jr4NDogw--6t7QOdJRLCZLZbX6nKvmg', path: 'assets/stitch_screens/08_payment.webp' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1UPPFQBt8YsQ6F7co8_-M9wqvoawcqCbPnanoZb4MFy4M2PBlyUiUf6Mrz3Mj6Nq09pqBoiWkSAe7w5fg2f2tN4JrbRJGDxzsPzayf5teKLs2XDnW4X31SeOXNssYiBOK_Gw2Ssg8slw60kh2EyJvn7oWSZVS6ktT-fU1O35hZaRC3Nv8-vQZBC1vq6B0zzhqzVe1UHENmBuhDV1Rf_la8oGIF06gXetNn4lcwbGR2DSzx5UXr5YjmdTeE', path: 'assets/images/care_meal_thumb.png' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1WcvBzi3rn-c5VF4Lh0SbpQ7F7UCMxfYjIMUJ1ZU5D5ivnFICswr0AR7NOkkXB5oDxCj7o-EaUPzThNeXkJzud9X4kCTTOrY4r9q8HTJ5i43c3HRwr1PPKtSDCinF2YPcbx7nbemQlaXvu9VCW6DUm2mW8MP6xwq5SiNPNWzmR7z-b_S6w19Th87KOW7R5gQVH5ctozh47MatT3g7s_C3sjrV8G4ay7_Htk2Fq-HqjEN_a-6wThOaCmZj0', path: 'assets/images/wellness_drink_thumb.png' },
  { url: 'https://lh3.googleusercontent.com/aida/AEtjO1WcqM_nfVXNvjHgNa7lvBYBsvFMiXBAslEmuUNa2WUKH1KK9AwDq4qWYl2w2TE-DDRq52VyqL7i5wNRkbYoXWRuXAmXLqgoPQqhaJho4S4VLuPsl8lknrG1JuNTjFn1x0h1_TLTu8cjlHGRSHZbAz9ln2yLoIn2hHaukblDDHpHI5XjnlGaiMyQEwSLUhTqsu70eB4_lx9P9tgI19ListDKUng574_BDPIPpG4BSUmCT-y0e-RV7_EdS48', path: 'assets/images/hotel_resort_thumb.png' }
];

fs.mkdirSync('assets/stitch_screens', { recursive: true });
fs.mkdirSync('assets/images', { recursive: true });

async function run() {
  for (const item of downloads) {
    try {
      console.log(`Downloading ${item.path}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error(`Failed ${item.url}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(item.path, buffer);
      console.log(`Saved ${item.path} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${item.path}:`, err);
    }
  }
}

run();
