import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { searchCities, DEPARTURE_QUICK_CITIES, ARRIVAL_QUICK_CITIES } from '../utils/cityDirectory'
import { ChevronLeft } from 'lucide-react'

// ─── Step indicator ───────────────────────────────────────────────────────────
function Stepper({ current, total }) {
  return (
    <div className="flex items-center gap-2 px-5 pb-4">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i < current ? 'bg-brand' : 'bg-border'}`} />
          {i < total - 1 && (
            <div className={`flex-1 h-[2px] mx-1 ${i < current - 1 ? 'bg-brand' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── WeightSlider ─────────────────────────────────────────────────────────────
function WeightSlider({ value, min, max, step = 1, onChange }) {
  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-[48px] font-extrabold text-ink">{value}</span>
        <span className="text-[20px] text-muted font-semibold ml-1">kg</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
      />
      <div className="flex justify-between mt-2 text-[13px] text-muted">
        <span>{min}kg</span><span>{max}kg</span>
      </div>
    </div>
  )
}

// ─── CitySelector ─────────────────────────────────────────────────────────────
function CitySelector({ label, icon, value, quickCities, onSelect }) {
  const [input, setInput] = useState(value)
  const suggestions = searchCities(input)

  function pick(city) {
    setInput(city)
    onSelect(city)
  }

  return (
    <div className="p-5 border border-border rounded-lg bg-white shadow-card">
      <div className="font-semibold text-[15px] text-ink mb-2">{label}</div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          type="text" value={input}
          onChange={e => { setInput(e.target.value); onSelect(e.target.value) }}
          placeholder={`输入${label}`}
          className="input pl-11"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {quickCities.map(c => (
          <button key={c} onClick={() => pick(c)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${c === value ? 'bg-brand text-white' : 'bg-surface text-secondary border border-border'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {suggestions.map(({ city, country, icon: flag }) => (
          <button key={city} onClick={() => pick(city)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${city === value ? 'border-brand bg-brand-light' : 'border-border bg-white'}`}>
            <span className="w-8 h-8 rounded-md bg-surface flex items-center justify-center text-[16px] flex-shrink-0">{flag}</span>
            <span className="text-left">
              <span className="block font-semibold text-[15px] text-ink">{city}</span>
              <span className="block text-[13px] text-muted">{country}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── PublishPage ──────────────────────────────────────────────────────────────
export default function PublishPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [step, setStep] = useState(1)
  const [type, setType] = useState('provide')   // 'provide' | 'seek'
  const [departure, setDeparture] = useState('慕尼黑')
  const [arrival, setArrival] = useState('成都')
  const [weight, setWeight] = useState(10)
  const [seekWeight, setSeekWeight] = useState(2)
  const [itemName, setItemName] = useState('')

  const totalSteps = 4

  function nextStep() {
    if (step < totalSteps) setStep(s => s + 1)
    else {
      showToast('发布成功！', 'success')
      setTimeout(() => navigate(type === 'provide' ? '/luggage' : '/'), 1500)
    }
  }
  function prevStep() { if (step > 1) setStep(s => s - 1) }

  const stepTitle = { 1: '需要什么服务？', 2: '从哪里到哪里？', 3: type === 'provide' ? '有多少重量？' : '是什么物品？', 4: type === 'provide' ? '准备发布！' : '确认信息！' }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-ink" />
        </button>
        <span className="font-bold text-[17px] text-ink">{type === 'provide' ? '发布帮带' : '寻找帮带'}</span>
        <div className="w-10" />
      </div>

      <Stepper current={step} total={totalSteps} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide px-5">
        <h2 className="text-[24px] font-bold text-ink mb-1">{stepTitle[step]}</h2>

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <p className="text-[14px] text-secondary mb-6">选择你要发布的类型</p>
            {[
              { value: 'provide', icon: '🧳', name: '提供帮带', desc: '我是旅行者，有多余行李额度可以帮带' },
              { value: 'seek',    icon: '📦', name: '寻找帮带', desc: '我有东西需要找人帮忙带回国' },
            ].map(opt => (
              <div key={opt.value} onClick={() => setType(opt.value)}
                className={`flex items-center gap-4 p-5 rounded-lg border-[1.5px] cursor-pointer transition-all ${type === opt.value ? 'border-brand bg-brand-light' : 'border-border bg-white'}`}>
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[24px] shadow-sm flex-shrink-0">{opt.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-[16px] text-ink">{opt.name}</div>
                  <div className="text-[13px] text-secondary mt-0.5">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Route */}
        {step === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-[14px] text-secondary mb-4">支持输入任意城市，常用路线可一键选择</p>
            <CitySelector label="出发城市" icon="🛫" value={departure} quickCities={DEPARTURE_QUICK_CITIES} onSelect={setDeparture} />
            <CitySelector label="到达城市" icon="🛬" value={arrival} quickCities={ARRIVAL_QUICK_CITIES} onSelect={setArrival} />
            <div className="bg-brand-light text-brand font-semibold text-[14px] rounded-lg px-4 py-3 mt-4">
              当前路线：{departure} → {arrival}
            </div>
          </div>
        )}

        {/* Step 3 provide: Weight + price */}
        {step === 3 && type === 'provide' && (
          <div className="mt-6">
            <p className="text-[14px] text-secondary mb-6">选择你可帮带的总重量</p>
            <WeightSlider value={weight} min={5} max={30} onChange={setWeight} />
            <div className="mt-6 bg-white rounded-lg p-5 shadow-card border border-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-semibold text-ink">收费标准</span>
                <span className="font-bold text-ink">¥50/kg</span>
              </div>
              <input type="text" placeholder="添加价格说明..." className="input" />
            </div>
          </div>
        )}

        {/* Step 3 seek: Item details */}
        {step === 3 && type === 'seek' && (
          <div className="mt-6 space-y-5">
            <p className="text-[14px] text-secondary">描述你要帮带的物品</p>
            <div>
              <div className="font-semibold text-[15px] text-ink mb-2">物品名称</div>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="例如：奶粉、护肤品、电子产品" className="input" />
            </div>
            <div>
              <div className="font-semibold text-[15px] text-ink mb-2">物品重量</div>
              <WeightSlider value={seekWeight} min={0.5} max={20} step={0.5} onChange={setSeekWeight} />
            </div>
            <div>
              <div className="font-semibold text-[15px] text-ink mb-2">物品描述</div>
              <textarea placeholder="详细描述你的物品，包括品牌、数量、是否有特殊要求等" className="input min-h-[100px] resize-none" />
            </div>
          </div>
        )}

        {/* Step 4 provide: Preview */}
        {step === 4 && type === 'provide' && (
          <div className="mt-6 space-y-4">
            <p className="text-[14px] text-secondary">确认信息并发布</p>
            <div className="bg-white rounded-lg shadow-card p-5 border-l-[3px] border-l-brand">
              {[['类型','🧳 提供帮带'],['路线',`${departure} → ${arrival}`],['总容量',`${weight}kg`],['收费标准','¥50/kg']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-border last:border-0">
                  <span className="text-secondary text-[14px]">{k}</span>
                  <span className="font-bold text-[14px] text-ink">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-card p-4 border-l-[3px] border-l-amber-400">
              <div className="font-bold mb-1 text-ink text-[15px]">⚠️ 安全提醒</div>
              <div className="text-[13px] text-secondary leading-relaxed">请遵守两国海关规定，不要帮带违禁品、药品、奢侈品等高风险物品。</div>
            </div>
          </div>
        )}

        {/* Step 4 seek: Preview */}
        {step === 4 && type === 'seek' && (
          <div className="mt-6 space-y-4">
            <p className="text-[14px] text-secondary">确认信息并发布</p>
            <div className="bg-white rounded-lg shadow-card p-5 border-l-[3px] border-l-amber-400">
              {[['类型','📦 寻找帮带'],['路线',`${departure} → ${arrival}`],['物品',itemName||'未填写'],['重量',`${seekWeight}kg`]].map(([k,v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-border last:border-0">
                  <span className="text-secondary text-[14px]">{k}</span>
                  <span className="font-bold text-[14px] text-ink">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-card p-4 border-l-[3px] border-l-amber-400">
              <div className="font-bold mb-1 text-ink text-[15px]">⚠️ 安全提醒</div>
              <div className="text-[13px] text-secondary leading-relaxed">请确保物品符合航空安全规定，不要寄送违禁品。</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
        <button onClick={prevStep} className={`flex-1 btn-outline ${step === 1 ? 'invisible' : ''}`}>返回</button>
        <button onClick={nextStep} className="flex-1 btn-primary">
          {step === totalSteps ? '发布' : '继续'}
        </button>
      </div>
    </div>
  )
}
