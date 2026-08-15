import{$ as e,Bt as t,Et as n,G as r,On as i,Q as a,V as o,X as s,Yt as c,Z as l,at as u,et as d,ht as f,in as p,it as m,jn as h,ot as g,wt as _,xt as v}from"./vendor-CR_3PVfi.js";import{At as ee,Dn as te,Ht as y,It as ne,On as re,Ot as b,Xn as ie,a as ae,dr as oe,fr as x,i as se,lt as ce,mt as le,st as ue,tt as de,zt as fe}from"./vendor-element-plus-DD7PlZ5s.js";import{n as pe}from"./vendor-i18n-CZZRrdG4.js";import{N as S,P as C,l as w}from"./index-OvfZRHM7.js";var T={class:`ai-chat-page`},E={class:`chat-sidebar`},D={class:`sidebar-header`},O={class:`history-list`},k=[`onClick`],A={class:`history-title text-ellipsis`},j={class:`sidebar-footer`},M={class:`chat-main`},N={key:0,class:`chat-welcome`},P={class:`welcome-icon`},F={class:`example-questions`},I=[`onClick`],L={class:`msg-avatar`},R={class:`msg-wrapper`},z=[`innerHTML`],B={key:0,class:`msg-actions`},me={key:0,class:`chat-msg assistant`},he={class:`msg-avatar`},ge={class:`msg-wrapper`},_e={class:`msg-bubble thinking-bubble`},ve={class:`chat-input-area`},ye={class:`input-wrapper`},V=w(g({__name:`index`,setup(g){let{t:w}=pe(),V=c(``),H=c(!1),U=c(),W=c(``),G=c([]);function be(){try{let e=S(`ai_conversations`);e&&(G.value=JSON.parse(e))}catch(e){}G.value.length===0?J():W.value=G.value[0].id}function K(){C(`ai_conversations`,JSON.stringify(G.value))}let q=s(()=>{let e=G.value.find(e=>e.id===W.value);return e?e.messages:[]});function J(){let e=`conv_`+Date.now();G.value.unshift({id:e,title:w(`ai.newChat`)+` `+(G.value.length+1),messages:[],updateTime:Date.now()}),W.value=e,K()}function xe(e){W.value=e,f(()=>$())}function Se(e){G.value=G.value.filter(t=>t.id!==e),G.value.length===0?J():W.value===e&&(W.value=G.value[0].id),K()}function Ce(){se.confirm(w(`ai.clearHistory`)+`?`,``,{type:`warning`}).then(()=>{G.value=[],J(),K()}).catch(()=>{})}let we=s(()=>[w(`ai.example1`),w(`ai.example2`),w(`ai.example3`)]);function Y(e){V.value=e,X()}function Te(e){e.shiftKey||(e.preventDefault(),X())}function X(){return Z.apply(this,arguments)}function Z(){return Z=o(function*(){let e=V.value.trim();if(!e||H.value)return;let t=G.value.find(e=>e.id===W.value);if(!t)return;t.messages.push({role:`user`,content:e}),t.messages.length===1&&(t.title=e.slice(0,30)),t.updateTime=Date.now(),V.value=``,H.value=!0,K(),yield f(),$();let n={"今天有哪些待办事项？":`## 📋 今日待办事项

| 序号 | 事项 | 优先级 | 截止时间 |
|---|---|---|---|
| 1 | 审批张三报销申请 | 🔴 紧急 | 17:00 |
| 2 | 跟进杭州科技合同 | 🔴 紧急 | 15:00 |
| 3 | 完成月度销售报告 | 🟡 普通 | 明天 12:00 |
| 4 | 回复客户技术咨询 | 🟡 普通 | 明天 10:00 |

> 建议优先处理审批和合同跟进事项。`,"本月的销售业绩如何？":`## 📊 本月销售业绩概览

**总业绩：¥128.6万** (目标：¥150万，完成率 85.7%)

### 分类统计
- 新签合同：¥82.3万 (12笔)
- 续签合同：¥46.3万 (8笔)

### Top 3 销售
1. 王五 - ¥38.2万
2. 赵六 - ¥32.1万
3. 孙七 - ¥28.5万

> 距离月度目标还差 ¥21.4万，建议加大客户拜访力度。`,帮我分析客户跟进情况:`## 🤝 客户跟进分析

### 本周跟进概况
- 已跟进客户：**23** 家
- 待跟进客户：**8** 家
- 新增线索：**5** 条

### ⚠️ 需关注
1. **杭州科技有限公司** - 合同即将到期，需优先续签
2. **宁波精密制造** - 新分配线索，3天未联系
3. **温州贸易公司** - 上次跟进已超7天`}[e]||`收到您的问题："`+e+`"。

AI 功能正在接入中，敬请期待！`;setTimeout(()=>{H.value=!1;let e={role:`assistant`,content:``};t.messages.push(e);let r=0,i=setInterval(()=>{r<n.length?(e.content+=n[r],r++,r%3==0&&f(()=>$())):(clearInterval(i),K(),f(()=>$()))},15)},600)}),Z.apply(this,arguments)}function Ee(e){let t=Q(e);return t=t.replace(/^### (.+)/gm,`<h4>$1</h4>`),t=t.replace(/^## (.+)/gm,`<h3>$1</h3>`),t=t.replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`),t=t.replace(/`([^`]+)`/g,`<code>$1</code>`),t=t.replace(/^&gt; (.+)/gm,`<blockquote>$1</blockquote>`),t=t.replace(/^- (.+)/gm,`<li>$1</li>`),t=t.replace(/^(\d+)\. (.+)/gm,`<li>$2</li>`),t=t.replace(/\|(.+)\|/g,e=>{let t=e.split(`|`).filter(e=>e.trim());return t.every(e=>/^[\s-]+$/.test(e))?``:`<tr>`+t.map(e=>`<td>`+e.trim()+`</td>`).join(``)+`</tr>`}),t=t.replace(/(<tr>[\s\S]*?<\/tr>)/g,`<table class="md-table">$1</table>`),t=t.replace(/\n/g,`<br>`),t=t.replace(/<\/h[3-4]><br>/g,e=>e.replace(`<br>`,``)),t=t.replace(/<\/li><br>/g,`</li>`),t=t.replace(/<\/blockquote><br>/g,`</blockquote>`),t}function Q(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function De(e){navigator.clipboard.writeText(e).then(()=>{ae.success(w(`ai.copySuccess`))})}function $(){U.value&&(U.value.scrollTop=U.value.scrollHeight)}return v(()=>{be()}),(o,s)=>{let c=le,f=de,g=ue,v=ce;return _(),d(`div`,T,[l(`aside`,E,[l(`div`,D,[u(f,{type:`primary`,class:`new-chat-btn`,onClick:J},{default:t(()=>[u(c,null,{default:t(()=>[u(p(te))]),_:1}),m(h(o.$t(`ai.newChat`)),1)]),_:1})]),l(`div`,O,[(_(!0),d(r,null,n(G.value,e=>(_(),d(`div`,{key:e.id,class:i([`history-item`,{active:W.value===e.id}]),onClick:t=>xe(e.id)},[u(c,{size:16},{default:t(()=>[u(p(b))]),_:1}),l(`span`,A,h(e.title),1),u(c,{class:`history-delete`,size:14,onClick:x(t=>Se(e.id),[`stop`])},{default:t(()=>[u(p(ne))]),_:1},8,[`onClick`])],10,k))),128))]),l(`div`,j,[u(f,{text:``,onClick:Ce},{default:t(()=>[u(c,null,{default:t(()=>[u(p(y))]),_:1}),m(h(o.$t(`ai.clearHistory`)),1)]),_:1})])]),l(`main`,M,[q.value.length===0?(_(),d(`div`,N,[l(`div`,P,[u(c,{size:48,color:`#F26522`},{default:t(()=>[u(p(b))]),_:1})]),l(`h2`,null,h(o.$t(`ai.title`)),1),l(`p`,null,h(o.$t(`ai.exampleQuestions`)),1),l(`div`,F,[(_(!0),d(r,null,n(we.value,(e,n)=>(_(),d(`div`,{class:`example-card`,key:n,onClick:t=>Y(e)},[u(c,{size:16},{default:t(()=>[u(p(ee))]),_:1}),l(`span`,null,h(e),1)],8,I))),128))])])):(_(),d(`div`,{key:1,class:`chat-messages`,ref_key:`chatMessagesRef`,ref:U},[(_(!0),d(r,null,n(q.value,(n,r)=>(_(),d(`div`,{key:r,class:i([`chat-msg`,n.role])},[l(`div`,L,[n.role===`assistant`?(_(),a(g,{key:0,size:36,class:`ai-avatar`},{default:t(()=>[...s[1]||(s[1]=[m(`AI`,-1)])]),_:1})):(_(),a(g,{key:1,size:36,class:`user-avatar`},{default:t(()=>[u(c,null,{default:t(()=>[u(p(ie))]),_:1})]),_:1}))]),l(`div`,R,[l(`div`,{class:`msg-bubble`,innerHTML:n.role===`assistant`?Ee(n.content):Q(n.content)},null,8,z),n.role===`assistant`?(_(),d(`div`,B,[u(f,{link:``,size:`small`,onClick:e=>De(n.content)},{default:t(()=>[u(c,null,{default:t(()=>[u(p(fe))]),_:1})]),_:1},8,[`onClick`])])):e(``,!0)])],2))),128)),H.value?(_(),d(`div`,me,[l(`div`,he,[u(g,{size:36,class:`ai-avatar`},{default:t(()=>[...s[2]||(s[2]=[m(`AI`,-1)])]),_:1})]),l(`div`,ge,[l(`div`,_e,[s[3]||(s[3]=l(`span`,{class:`typing-dots`},[l(`span`),l(`span`),l(`span`)],-1)),m(h(o.$t(`ai.thinking`)),1)])])])):e(``,!0)],512)),l(`div`,ve,[l(`div`,ye,[u(v,{modelValue:V.value,"onUpdate:modelValue":s[0]||(s[0]=e=>V.value=e),type:`textarea`,autosize:{minRows:1,maxRows:4},placeholder:o.$t(`ai.inputTip`),onKeydown:oe(x(Te,[`exact`]),[`enter`]),resize:`none`},null,8,[`modelValue`,`placeholder`,`onKeydown`]),u(f,{type:`primary`,icon:p(re),circle:``,class:`send-btn`,onClick:X,disabled:!V.value.trim()||H.value},null,8,[`icon`,`disabled`])])])])])}}}),[[`__scopeId`,`data-v-4f888a13`]]);export{V as default};