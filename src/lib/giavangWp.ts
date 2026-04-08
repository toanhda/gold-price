/** Trang Spot gold trên GiaVang.Net (WordPress) */
export const GIAVANG_SPOT_GOLD_URL =
  'https://giavang.net/bieu-do-gia-vang-the-gioi-spot-gold/'

const WP_PAGE_ENDPOINT =
  'https://giavang.net/wp-json/wp/v2/pages?slug=bieu-do-gia-vang-the-gioi-spot-gold'

type WpPage = {
  content?: { rendered?: string }
}

export async function fetchGiaVangSpotGoldEntryHtml(): Promise<string> {
  const res = await fetch(WP_PAGE_ENDPOINT)
  if (!res.ok) {
    throw new Error(`WP ${res.status}`)
  }
  const data: WpPage[] = await res.json()
  const html = data[0]?.content?.rendered
  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('Không có nội dung trang')
  }
  return html
}
