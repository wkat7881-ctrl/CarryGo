// City directory used in Publish flow
export const CITY_DIRECTORY = [
  { city: '慕尼黑', country: '德国', icon: '🇩🇪' },
  { city: '柏林', country: '德国', icon: '🇩🇪' },
  { city: '法兰克福', country: '德国', icon: '🇩🇪' },
  { city: '巴黎', country: '法国', icon: '🇫🇷' },
  { city: '阿姆斯特丹', country: '荷兰', icon: '🇳🇱' },
  { city: '伦敦', country: '英国', icon: '🇬🇧' },
  { city: '米兰', country: '意大利', icon: '🇮🇹' },
  { city: '苏黎世', country: '瑞士', icon: '🇨🇭' },
  { city: '维也纳', country: '奥地利', icon: '🇦🇹' },
  { city: '成都', country: '中国', icon: '🇨🇳' },
  { city: '上海', country: '中国', icon: '🇨🇳' },
  { city: '北京', country: '中国', icon: '🇨🇳' },
  { city: '广州', country: '中国', icon: '🇨🇳' },
  { city: '深圳', country: '中国', icon: '🇨🇳' },
  { city: '香港', country: '中国', icon: '🇭🇰' },
  { city: '东京', country: '日本', icon: '🇯🇵' },
  { city: '首尔', country: '韩国', icon: '🇰🇷' },
  { city: '新加坡', country: '新加坡', icon: '🇸🇬' },
  { city: '曼谷', country: '泰国', icon: '🇹🇭' },
  { city: '纽约', country: '美国', icon: '🇺🇸' },
]

export const DEPARTURE_QUICK_CITIES = ['慕尼黑', '柏林', '巴黎', '法兰克福']
export const ARRIVAL_QUICK_CITIES   = ['成都', '上海', '北京', '广州']

export function searchCities(keyword, limit = 4) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return CITY_DIRECTORY.slice(0, limit)
  return CITY_DIRECTORY
    .filter(({ city, country }) =>
      city.toLowerCase().includes(kw) || country.toLowerCase().includes(kw)
    )
    .slice(0, limit)
}
