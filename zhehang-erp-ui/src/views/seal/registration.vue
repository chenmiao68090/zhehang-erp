<template>
  <div class="seal-reg" :class="{ 'seal-reg--embedded': props.embedded }">
    <template v-if="!props.createOnly">
    <header class="sr-head">
      <div v-if="!props.embedded">
        <h2 class="sr-title">刻章提单登记</h2>
        <p class="sr-sub">每天来刻章的客户提单:基本信息、印章状态与材质、收款、备案与配送。</p>
      </div>
      <div class="sr-actions">
        <el-input v-model="keyword" class="sr-search" placeholder="搜公司名…" clearable @keyup.enter="reload" @clear="reload" />
        <el-select v-model="statusFilter" placeholder="状态" clearable class="sr-filter" @change="reload">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-checkbox v-model="invoiceFilter" border @change="reload">仅看待开票</el-checkbox>
        <el-button v-if="!props.embedded" :loading="qrLoading" @click="openQr"><el-icon><Promotion /></el-icon> 客户自助码</el-button>
        <el-button v-if="!props.embedded" type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 新增提单</el-button>
      </div>
    </header>

    <div class="sr-stats">
      <div class="sr-stat"><span class="sr-stat-num">{{ stats.todayCount }}</span><span class="sr-stat-label">今日提单</span></div>
      <div class="sr-stat"><span class="sr-stat-num">{{ stats.monthCount }}</span><span class="sr-stat-label">本月提单</span></div>
      <div class="sr-stat sr-stat--fee"><span class="sr-stat-num">¥{{ fmtMoney(stats.monthFee) }}</span><span class="sr-stat-label">本月收款</span></div>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="提单日期" prop="regDate" width="106" />
      <el-table-column label="公司名称" prop="companyName" min-width="170" show-overflow-tooltip />
      <el-table-column label="业绩部门" prop="perfDept" width="96" />
      <el-table-column label="印章状态" prop="sealStatus" width="96" />
      <el-table-column label="备案状态" prop="recordStatus" width="96">
        <template #default="{ row }">{{ row.recordStatus || '—' }}</template>
      </el-table-column>
      <el-table-column label="材质/类型" min-width="150">
        <template #default="{ row }">
          <span>{{ fmtMaterial(row.sealMaterial) }}</span>
          <el-tag v-for="t in splitTypes(row.sealTypes)" :key="t" size="small" effect="plain" style="margin: 2px">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="应刻法人章姓名" prop="legalPerson" width="120" show-overflow-tooltip />
      <el-table-column label="快递单号" prop="trackingNo" width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.trackingNo || '—' }}</template>
      </el-table-column>
      <el-table-column label="城市" prop="sealCity" width="72" />
      <el-table-column label="收费" width="84" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.fee) }}</template>
      </el-table-column>
      <el-table-column label="收款方式" prop="payMethod" width="120" show-overflow-tooltip />
      <el-table-column label="备案/寄出/交付" width="130" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.isRecord ? 'success' : 'info'" effect="plain">备{{ row.isRecord ? '✓' : '—' }}</el-tag>
          <el-tag size="small" :type="row.isShipped ? 'success' : 'info'" effect="plain">寄{{ row.isShipped ? '✓' : '—' }}</el-tag>
          <el-tag size="small" :type="row.isDelivered ? 'success' : 'info'" effect="plain">付{{ row.isDelivered ? '✓' : '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-select v-model="row.status" size="small" :disabled="row._statusSaving" @change="onRowStatusChange(row)">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openForm(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="今天还没有刻章提单" :image-size="80">
          <el-button v-if="!props.embedded" type="primary" @click="openForm()">新增提单</el-button>
        </el-empty>
      </template>
    </el-table>

    <div class="sr-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="loadData" @size-change="reload" />
    </div>
    </template>

    <!-- 提单弹窗 -->
    <el-dialog v-model="dialog.visible" :title="form.id ? '编辑刻章提单' : '新增刻章提单'" width="720px" destroy-on-close top="5vh" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form :model="form" label-width="116px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="14">
          <el-col :span="8">
            <el-form-item label="提单日期" required>
              <el-date-picker v-model="form.regDate" type="date" value-format="YYYY-MM-DD" :disabled-date="disabledBeforeToday" placeholder="默认今天" style="width: 100%" @change="onRegDate" />
            </el-form-item>
          </el-col>
          <el-col :span="8"><el-form-item label="年/月"><el-input :model-value="yearMonthText" disabled /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="业绩归属部门" required><el-select v-model="form.perfDept" placeholder="选择部门" style="width: 100%"><el-option v-for="d in PERF_DEPTS" :key="d" :label="d" :value="d" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="业务归属人"><el-input v-model="form.ownerName" placeholder="默认提交人" /></el-form-item></el-col>
          <el-col :span="16">
            <el-form-item label="业务类型">
              <el-radio-group v-model="form.bizType" @change="onBizType">
                <el-radio-button value="new">新客户</el-radio-button>
                <el-radio-button value="old">老客户(长期合作)</el-radio-button>
              </el-radio-group>
              <el-select v-if="form.bizType === 'old'" v-model="form.partnerId" filterable placeholder="从长期合作客户选" style="width: 240px; margin-left: 12px" @change="onPickPartner">
                <el-option v-for="p in partners" :key="p.id" :label="p.companyName" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="公司名称" required>
              <el-input v-model="form.companyName" placeholder="刻章单位公司全称(含中文括号也要写进去,如:杭州XX(个体工商户))" />
              <el-alert v-if="dupWarning" type="warning" :closable="false" show-icon :title="dupWarning" style="margin-top:6px" />
            </el-form-item>
          </el-col>
          <el-col :span="8"><el-form-item label="法人"><el-input v-model="form.legalPerson" placeholder="法定代表人" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="对接人手机号" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">印章信息</el-divider>
        <el-row :gutter="14">
          <el-col :span="8"><el-form-item label="印章状态" required>
            <el-select v-model="form.sealStatus" placeholder="选择" style="width: 100%" @change="onSealStatus"><el-option v-for="s in SEAL_STATUSES" :key="s" :label="s" :value="s" /></el-select>
            <el-tag v-if="luoboConfirmed" type="danger" effect="dark" size="small" style="margin-top:6px">⚠ 已确认萝卜章(私下刻制)</el-tag>
          </el-form-item></el-col>
          <el-col :span="8"><el-form-item label="备案状态">
            <el-select v-model="form.recordStatus" placeholder="选择" clearable style="width: 100%" @change="onRecordStatus"><el-option v-for="s in RECORD_STATUSES" :key="s" :label="s" :value="s" /></el-select>
          </el-form-item></el-col>
          <el-col :span="8">
            <el-form-item label="刻章城市">
              <el-select v-model="form.sealCity" placeholder="选择城市" style="width: 100%"><el-option v-for="c in SEAL_CITIES" :key="c" :label="c" :value="c" /></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="印章材质">
              <el-select v-model="sealMaterialList" multiple placeholder="可多选(公财法一起刻)" style="width: 100%" @change="onMaterial"><el-option v-for="m in MATERIALS" :key="m" :label="m" :value="m" /></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.sealCity && form.sealCity !== '杭州'">
            <el-alert type="warning" :closable="false" show-icon title="刻章区域为杭州以外:加收 80 元/个,且必须提交法人靠白墙半身照。" style="margin-bottom: 12px" />
          </el-col>
          <el-col :span="24">
            <el-form-item label="印章类型">
              <div v-if="sealMaterialList.length" class="sr-type-groups">
                <div v-for="g in materialTypeGroups" :key="g.material" class="sr-type-group">
                  <span class="sr-type-mat">{{ g.material }}</span>
                  <el-checkbox-group v-model="sealTypeList" class="sr-type-checks">
                    <el-checkbox v-for="c in g.combos" :key="c.value" :value="c.value" border>{{ c.type }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
              <span v-if="sealMaterialList.length" class="sr-hint">已按"材质-类型"记录(如 光敏-法定名称章);取消某个材质,它名下的类型会自动取消。法定名称章=公章,法定代表人名章=法人章,某某专用章=业务专用章(备注说明)。</span>
              <span v-else class="sr-hint">先选印章材质,再勾选对应的印章类型</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="身份证">
              <div class="sr-id-uploads">
                <el-upload :show-file-list="false" :http-request="(o: any) => uploadId('front', o)" :accept="SEAL_UPLOAD_ACCEPT">
                  <el-button>{{ form.idCardFront ? '正面 已上传 ✓' : '上传正面' }}</el-button>
                </el-upload>
                <template v-if="form.idCardFront">
                  <el-button size="small" link type="primary" @click="previewAttachment(simpleFile(form.idCardFront, '身份证正面'))"><el-icon><View /></el-icon>预览正面</el-button>
                  <el-button size="small" link @click="downloadFile(simpleFile(form.idCardFront, '身份证正面'))"><el-icon><Download /></el-icon>下载正面</el-button>
                  <el-button size="small" type="danger" link @click="removeId('front')">删除正面</el-button>
                </template>
                <el-upload :show-file-list="false" :http-request="(o: any) => uploadId('back', o)" :accept="SEAL_UPLOAD_ACCEPT">
                  <el-button>{{ form.idCardBack ? '反面 已上传 ✓' : '上传反面' }}</el-button>
                </el-upload>
                <template v-if="form.idCardBack">
                  <el-button size="small" link type="primary" @click="previewAttachment(simpleFile(form.idCardBack, '身份证反面'))"><el-icon><View /></el-icon>预览反面</el-button>
                  <el-button size="small" link @click="downloadFile(simpleFile(form.idCardBack, '身份证反面'))"><el-icon><Download /></el-icon>下载反面</el-button>
                  <el-button size="small" type="danger" link @click="removeId('back')">删除反面</el-button>
                </template>
                <span class="sr-hint">仅支持 JPG/JPEG 图片或 PDF。PNG 请先另存为 JPG 后上传。</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">办理资料</el-divider>
        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="办理人">
              <el-switch v-model="form.handlerIsLegal" :active-value="1" :inactive-value="0" active-text="法人本人" inactive-text="非法人" inline-prompt />
              <span class="sr-hint" v-if="form.handlerIsLegal === 0">非法人需加传:经办人身份证、经办人半身照、授权委托说明</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.sealStatus === '遗失登报'">
            <el-form-item label="是否我们登报"><el-switch v-model="form.isWePublish" :active-value="1" :inactive-value="0" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="资料上传">
              <div class="sr-doc-grid">
                <div v-for="d in docSlots" :key="d.key" class="sr-doc-slot">
                  <el-upload :show-file-list="false" :http-request="(o: any) => uploadDoc(d.key, o)" :accept="SEAL_UPLOAD_ACCEPT">
                    <el-button size="small" plain :type="docs[d.key] ? 'success' : (d.required ? 'warning' : 'info')">
                      {{ docs[d.key] ? '✓ ' : (d.required ? '※ ' : '') }}{{ d.label }}
                    </el-button>
                  </el-upload>
                  <div v-if="docs[d.key]" class="sr-file-actions">
                    <button type="button" class="sr-file-name" @click="previewAttachment(docs[d.key])">{{ docs[d.key].fileName }}</button>
                    <el-button size="small" link type="primary" @click="previewAttachment(docs[d.key])"><el-icon><View /></el-icon>预览</el-button>
                    <el-button size="small" link @click="downloadFile(docs[d.key])"><el-icon><Download /></el-icon>下载</el-button>
                    <el-button size="small" link type="danger" @click="removeDoc(d.key)">删除</el-button>
                  </div>
                </div>
              </div>
              <span class="sr-hint">标 ※ 为必传;仅支持 JPG/JPEG 图片或 PDF。资料随印章状态、是否外区域、是否法人本人自动变化。</span>
              <div v-if="pastedDocs.length" class="sr-pasted">
                <span class="sr-hint" style="margin: 0">粘贴的附件:</span>
                <div v-for="d in pastedDocs" :key="d.key" class="sr-file-chip">
                  <button type="button" class="sr-file-name" @click="previewAttachment(d)">{{ d.fileName }}</button>
                  <el-button size="small" link type="primary" @click="previewAttachment(d)"><el-icon><View /></el-icon>预览</el-button>
                  <el-button size="small" link @click="downloadFile(d)"><el-icon><Download /></el-icon>下载</el-button>
                  <el-button size="small" link type="danger" @click="removeDoc(d.key)">删除</el-button>
                </div>
              </div>
              <span class="sr-hint">📋 可粘贴 JPG/JPEG 图片;PNG 截图请先转换成 JPG,PDF 请点击上传。</span>
            </el-form-item>
            <el-form-item label="其他资料">
              <el-upload :show-file-list="false" :http-request="(o: any) => uploadOther(o)" :accept="SEAL_UPLOAD_ACCEPT" multiple>
                <el-button size="small" plain type="info"><el-icon><Plus /></el-icon> 上传其他资料(可多张)</el-button>
              </el-upload>
              <div v-if="otherDocs.length" class="sr-pasted">
                <div v-for="d in otherDocs" :key="d.key" class="sr-file-chip">
                  <button type="button" class="sr-file-name" @click="previewAttachment(d)">{{ d.fileName }}</button>
                  <el-button size="small" link type="primary" @click="previewAttachment(d)"><el-icon><View /></el-icon>预览</el-button>
                  <el-button size="small" link @click="downloadFile(d)"><el-icon><Download /></el-icon>下载</el-button>
                  <el-button size="small" link type="danger" @click="removeDoc(d.key)">删除</el-button>
                </div>
              </div>
              <span class="sr-hint">任何印章状态都可用的备用资料位:补充说明、承诺书、其他辅助材料等。</span>
            </el-form-item>
            <el-form-item label="申请模板" v-if="relevantTemplates.length">
              <div class="sr-templates">
                <a v-for="t in relevantTemplates" :key="t.file" :href="t.url" :download="t.name + '.docx'" class="sr-tpl-link">
                  <el-button size="small" type="primary" plain><el-icon><Download /></el-icon> {{ t.name }}</el-button>
                </a>
              </div>
              <span class="sr-hint">按当前印章状态/办理人匹配的申请模板,点击下载填写盖章。</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">收款</el-divider>
        <el-row :gutter="14">
          <el-col :span="8"><el-form-item label="收费金额"><el-input-number v-model="form.fee" :min="0" :precision="2" controls-position="right" style="width: 100%" /><span class="sr-hint">参考售价:公章/合同章 80 元/个,法人章 40 元/个</span></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="收款方式"><el-select v-model="form.payMethod" filterable placeholder="选择收款方式" style="width: 100%"><el-option v-for="m in PAY_METHODS" :key="m" :label="m" :value="m" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="收款日期"><el-date-picker v-model="form.payDate" type="date" value-format="YYYY-MM-DD" placeholder="具体收款日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8">
            <el-form-item label="收款凭证">
              <div class="sr-id-uploads">
                <el-upload :show-file-list="false" :http-request="(o: any) => uploadPayVoucher(o)" :accept="SEAL_UPLOAD_ACCEPT">
                  <el-button :type="docs['payVoucher'] ? 'success' : 'default'">{{ docs['payVoucher'] ? '已上传 ✓ 可重传' : '上传收款凭证' }}</el-button>
                </el-upload>
                <template v-if="docs['payVoucher']">
                  <el-button size="small" link type="primary" @click="previewAttachment(docs['payVoucher'])"><el-icon><View /></el-icon>预览</el-button>
                  <el-button size="small" link @click="downloadFile(docs['payVoucher'])"><el-icon><Download /></el-icon>下载</el-button>
                  <el-button size="small" type="danger" link @click="removeDoc('payVoucher')">删除</el-button>
                </template>
              </div>
              <span class="sr-hint">收款截图/转账凭证等,存入本单资料。</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付宝收款码">
              <div class="sr-id-uploads">
                <el-upload :show-file-list="false" :http-request="(o: any) => uploadAlipayQr(o)" :accept="SEAL_UPLOAD_ACCEPT">
                  <el-button :type="form.customerAlipayQr ? 'success' : 'default'">{{ form.customerAlipayQr ? '已上传 ✓ 可重传' : '上传客户支付宝收款码' }}</el-button>
                </el-upload>
                <template v-if="form.customerAlipayQr">
                  <el-button size="small" link type="primary" @click="previewAttachment(simpleFile(form.customerAlipayQr, '客户支付宝收款码'))"><el-icon><View /></el-icon>预览</el-button>
                  <el-button size="small" link @click="downloadFile(simpleFile(form.customerAlipayQr, '客户支付宝收款码'))"><el-icon><Download /></el-icon>下载</el-button>
                  <el-button size="small" type="danger" link @click="removeAlipayQr">删除</el-button>
                </template>
              </div>
              <span class="sr-hint">客户的支付宝收款二维码,退款/返点给客户打款时使用。仅支持 JPG/JPEG 或 PDF。</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">备案与配送</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="是否备案"><el-switch v-model="form.isRecord" :active-value="1" :inactive-value="0" /> <el-button size="small" link type="primary" @click="openRecordQuery">查浙江省印章备案↗</el-button></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="是否寄出"><el-switch v-model="form.isShipped" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="12" v-if="form.isShipped"><el-form-item label="快递单号"><el-input v-model="form.trackingNo" placeholder="快递单号" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="是否交付"><el-switch v-model="form.isDelivered" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="是否邮寄"><el-switch v-model="form.isMail" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <template v-if="form.isMail">
            <el-col :span="12"><el-form-item label="收件人"><el-input v-model="form.recipient" /></el-form-item></el-col>
            <el-col :span="24"><el-form-item label="收件地址"><el-input v-model="form.address" type="textarea" :rows="2" /></el-form-item></el-col>
          </template>
        </el-row>

        <el-divider content-position="left">运营成本(自动估算)</el-divider>
        <el-row :gutter="14">
          <el-col :span="8"><el-form-item label="快递类型"><el-select v-model="form.deliveryType" placeholder="选择" clearable style="width: 100%"><el-option v-for="d in DELIVERY_TYPES" :key="d" :label="d" :value="d" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="登报费用"><el-input-number v-model="form.publishFee" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="印章个数">{{ sealCount }} 个</el-form-item></el-col>
          <el-col :span="8" v-if="form.sealCity && form.sealCity !== '杭州'">
            <el-form-item label="外区域备案费">
              <el-input-number v-model="form.outRegionFee" :min="0" :precision="2" controls-position="right" placeholder="默认25/个" style="width: 100%" />
              <span class="sr-hint">默认按 25 元/个估算,可手动改成实际成本</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="sr-cost">
              <span>外区域备案费 <b>¥{{ fmtMoney(outRegionFee) }}</b></span>
              <span>快递费 <b>¥{{ fmtMoney(deliveryFee) }}</b></span>
              <span>印章消耗 <b>¥{{ fmtMoney(materialCost) }}</b></span>
              <span>登报费 <b>¥{{ fmtMoney(Number(form.publishFee || 0)) }}</b></span>
              <span class="sr-cost-total">运营成本合计 <b>¥{{ fmtMoney(opCostTotal) }}</b></span>
            </div>
          </el-col>
        </el-row>

        <el-divider content-position="left">发票与业务支出</el-divider>
        <el-row :gutter="14">
          <el-col :span="6"><el-form-item label="是否开票"><el-switch v-model="form.needInvoice" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <template v-if="form.needInvoice">
            <el-col :span="12"><el-form-item label="开票信息"><el-input v-model="form.invoiceInfo" placeholder="抬头/税号/开票内容" /></el-form-item></el-col>
            <el-col :span="6"><el-form-item label="开票已完成"><el-switch v-model="form.invoiceDone" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          </template>
          <el-col :span="8"><el-form-item label="返点成本"><el-input-number v-model="form.rebateCost" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="刻章退款"><el-input-number v-model="form.refundAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="24" v-if="form.needInvoice && !form.invoiceDone"><span class="sr-hint">勾了"需开票"保存后,会给会计生成一条「刻章待开票」站内待办;也可在列表上方「仅看待开票」筛选。</span></el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="8"><el-form-item label="状态"><el-select v-model="form.status" style="width: 100%"><el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" /></el-select></el-form-item></el-col>
          <el-col :span="16"><el-form-item label="备注"><el-input v-model="form.remark" placeholder="可选" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button v-if="!form.id" :loading="dialog.saving" @click="submitAndNext">保存并加下一单位</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="filePreview.visible" :title="filePreview.title" width="72vw" destroy-on-close append-to-body @closed="clearPreview">
      <div class="sr-preview">
        <img v-if="filePreview.type === 'image'" :src="filePreview.url" alt="附件预览" class="sr-preview-img" />
        <iframe v-else-if="filePreview.type === 'pdf'" :src="filePreview.url" class="sr-preview-frame" title="附件预览"></iframe>
        <el-empty v-else description="这个格式不能在线预览，可下载后查看">
          <el-button type="primary" @click="filePreview.file && downloadFile(filePreview.file)"><el-icon><Download /></el-icon> 下载附件</el-button>
        </el-empty>
      </div>
    </el-dialog>

    <!-- 客户自助提交二维码 -->
    <el-dialog v-model="qrVisible" title="客户自助提交二维码" width="380px">
      <div style="text-align:center">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="刻章客户自助二维码" style="width:280px;height:280px" />
        <p style="margin:12px 0 6px;color:var(--el-text-color-secondary);font-size:13px">客户扫码后可免登录填写一份刻章资料；安全链接绑定当前公司，提交成功后立即失效</p>
        <p v-if="selfServiceExpiresText" style="margin:0 0 8px;color:var(--el-color-warning);font-size:12px">有效期至 {{ selfServiceExpiresText }}，过期后请重新生成</p>
        <el-input :model-value="selfServiceUrl" readonly size="small" style="margin-bottom:10px">
          <template #append><el-button @click="copySelfUrl">复制链接</el-button></template>
        </el-input>
        <el-button type="primary" @click="downloadQr"><el-icon><Download /></el-icon> 下载二维码(可打印/发群)</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Promotion, View } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import { sealOrderApi, type SealOrder } from '@/api/seal'
import { fileInfoApi } from '@/api/file'
import { partnerApi } from '@/api/partner'
import { useUserStore } from '@/stores/user'
import { createAttachmentPreview, downloadAttachment, type AttachmentPreview, type AttachmentRef } from '@/utils/file-viewer'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'

const props = withDefaults(defineProps<{ createOnly?: boolean; embedded?: boolean; initialData?: Partial<SealOrder> }>(), {
  createOnly: false,
  embedded: false
})
const emit = defineEmits<{ closed: []; saved: [] }>()

const PERF_DEPTS = ['刻章部', '会计部', '工商部', '总经办', '人力行政部', '运营支持部', '销售部']
const SEAL_STATUSES = ['新设刻章', '变更刻章', '损坏重刻', '遗失声明', '遗失登报', '萝卜章', '仅备案']
// 备案状态:与印章状态并列的独立字段(萝卜章/仅备案等备案相关单独成一字段,additive 不动印章状态)
const RECORD_STATUSES = ['备案刻章', '仅备案', '萝卜章', '仅登报']
const SEAL_CITIES = ['杭州', '台州', '温州', '金华', '宁波', '湖州', '绍兴', '嘉兴', '衢州', '丽水', '舟山']
const MATERIALS = ['光敏', '牛角', '回墨']

// 各印章状态对应的公安申请模板(docx 放在 public/seal-templates/,选状态即可下载填写)
const SEAL_TEMPLATES: Record<string, Array<{ name: string; file: string }>> = {
  '变更刻章': [{ name: '变更后重新刻章申请及情况说明', file: 'change' }],
  '损坏重刻': [{ name: '印章损坏情况说明及重新刻章申请', file: 'damaged' }],
  '遗失声明': [{ name: '印章遗失情况说明及重刻申请', file: 'lost' }],
  '遗失登报': [{ name: '印章遗失情况说明及重刻申请', file: 'lost' }]
}
const relevantTemplates = computed(() => {
  const list = [...(SEAL_TEMPLATES[form.value.sealStatus || ''] || [])]
  if (form.value.handlerIsLegal === 0) list.push({ name: '印章刻制委托情况说明', file: 'entrust' }) // 非法人办理需委托说明
  list.push({ name: '印章缴销申请书', file: 'cancel' }) // 缴销申请书常用,始终提供
  return list.map(t => ({ ...t, url: `/seal-templates/${t.file}.docx` }))
})
// 材质 → 可选印章类型
const MATERIAL_TYPES: Record<string, string[]> = {
  光敏: ['法定名称章', '合同专用章', '发票专用章', '某某专用章'],
  牛角: ['财务专用章', '法定代表人名章'],
  回墨: ['法定名称章', '合同专用章', '某某专用章']
}
const PAY_METHODS = ['待结算', '浙杭刻章码丨微信', '浙杭刻章码丨支付宝', '周结算丨累计结算', '月度待结算', '线上核销', '浙杭对公丨光大', '主营业务扣款', '赠送', '诚路扫码丨丰收银联', '陈总丨个人微信收款', '收支抵扣']
const SEAL_UPLOAD_ACCEPT = '.jpg,.jpeg,.pdf,image/jpeg,application/pdf'
const SEAL_UPLOAD_TIP = '只能上传 JPG/JPEG 图片或 PDF 文件，PNG 请先另存/转换为 JPG 后上传'
const DELIVERY_TYPES = ['顺丰到付', '顺丰寄付', '京东寄付', '闪送寄付', '客户自取', '同事自取']
const DELIVERY_FEE: Record<string, number> = { 顺丰到付: 0, 顺丰寄付: 10, 京东寄付: 8, 闪送寄付: 15 }
const MATERIAL_COST: Record<string, number> = { 光敏: 2, 牛角: 2, 回墨: 15 }
// 状态下拉(问题6:按刻章流转顺序排列)
const statusOptions = [
  { value: 'lack', label: '缺资料' },
  { value: 'recorded', label: '已备案' },
  { value: 'pending', label: '待刻章' },
  { value: 'engraved', label: '已刻制' },
  { value: 'mailed', label: '已邮寄' },
  { value: 'taken', label: '已取走' },
  { value: 'done', label: '已完成' }
]

const userStore = useUserStore()
const rows = ref<SealOrder[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref<string>()
const invoiceFilter = ref(false)
const partners = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await sealOrderApi.list({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value || undefined, status: statusFilter.value || undefined, needInvoice: invoiceFilter.value ? 1 : undefined, invoiceDone: invoiceFilter.value ? 0 : undefined })
    const page = res?.data ?? res
    rows.value = page?.records || page?.list || []
    total.value = Number(page?.total ?? rows.value.length)
  } catch { rows.value = []; total.value = 0 } finally { loading.value = false }
  loadStats()
}
const reload = () => { pageNum.value = 1; loadData() }

const stats = ref({ monthCount: 0, monthFee: 0, todayCount: 0 })
const loadStats = async () => {
  try {
    const res: any = await sealOrderApi.list({ pageNum: 1, pageSize: 1000 })
    const list = (res?.data ?? res)?.records || []
    const ym = todayStr().slice(0, 7)
    const today = todayStr()
    let mc = 0, mf = 0, tc = 0
    list.forEach((r: SealOrder) => {
      const d = String(r.regDate || '')
      if (d.slice(0, 7) === ym) { mc++; mf += Number(r.fee || 0) }
      if (d === today) tc++
    })
    stats.value = { monthCount: mc, monthFee: mf, todayCount: tc }
  } catch { /* 统计失败不影响列表 */ }
}

const loadPartners = async () => {
  try {
    const res: any = await partnerApi.list({ pageNum: 1, pageSize: 1000 })
    partners.value = (res?.data ?? res)?.records || []
  } catch { partners.value = [] }
}

const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const disabledBeforeToday = (date: Date) => {
  const t = new Date(); t.setHours(0, 0, 0, 0)
  return date.getTime() < t.getTime()
}

const dialog = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<SealOrder>({})

// 客户自助二维码:登录经办人每次生成绑定当前租户、24小时有效的一次性安全链接
const qrVisible = ref(false)
const qrDataUrl = ref('')
const qrLoading = ref(false)
const selfServiceUrl = ref('')
const selfServiceExpiresAt = ref(0)
const selfServiceExpiresText = computed(() => selfServiceExpiresAt.value
  ? new Date(selfServiceExpiresAt.value).toLocaleString('zh-CN', { hour12: false })
  : '')
async function openQr() {
  qrLoading.value = true
  try {
    const res: any = await sealOrderApi.issuePublicToken()
    const ticket = res?.data ?? res
    if (!ticket?.token || !/^[0-9a-f]{64}$/.test(ticket.token)) throw new Error('安全链接签发失败')
    // 票据放 URL fragment：浏览器不会把 # 后内容发送给 Nginx，避免安全票据进入访问日志。
    selfServiceUrl.value = `${window.location.origin}/seal/submit#ticket=${ticket.token}`
    selfServiceExpiresAt.value = Number(ticket.expiresAt || 0)
    qrDataUrl.value = await QRCode.toDataURL(selfServiceUrl.value, { width: 280, margin: 2 })
    qrVisible.value = true
  } catch (error: any) {
    selfServiceUrl.value = ''
    selfServiceExpiresAt.value = 0
    qrDataUrl.value = ''
    ElMessage.error(error?.response?.data?.message || error?.message || '安全链接生成失败，请稍后重试')
  } finally {
    qrLoading.value = false
  }
}
function downloadQr() {
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = '刻章客户自助二维码.png'
  a.click()
}
async function copySelfUrl() {
  if (!selfServiceUrl.value) return
  try {
    await navigator.clipboard.writeText(selfServiceUrl.value)
    ElMessage.success('链接已复制,可直接发给客户')
  } catch {
    ElMessage.error('复制失败,请手动选中链接复制')
  }
}
const sealTypeList = ref<string[]>([])
// 印章材质多选(公财法可一起刻);form.sealMaterial 存库仍为逗号串,这里用数组做 v-model
const sealMaterialList = ref<string[]>([])
// 萝卜章二次确认标记;prevSealStatus 用于用户取消时回退
const luoboConfirmed = ref(false)
let prevSealStatus = ''

const yearMonthText = computed(() => {
  const d = String(form.value.regDate || '')
  if (d.length < 7) return ''
  return `${d.slice(0, 4)}年 ${Number(d.slice(5, 7))}月`
})
// 问题1:按材质分组给出"材质-类型"组合;每个组合值形如 光敏-法定名称章,
// 这样界面一眼看清哪个类型属于哪个材质,取消某材质会自动移除它名下的类型
const materialTypeGroups = computed(() =>
  sealMaterialList.value.map((m) => ({
    material: m,
    combos: (MATERIAL_TYPES[m] || []).map((t) => ({ type: t, value: `${m}-${t}` }))
  }))
)

// 新客户查重:输入公司名时比对长期合作客户,命中则提示可能是老客户
const dupWarning = computed(() => {
  if (form.value.bizType !== 'new' || !form.value.companyName) return ''
  const name = String(form.value.companyName).trim()
  if (name.length < 3) return ''
  const hit = partners.value.find((p: any) => p.companyName && (p.companyName === name || String(p.companyName).includes(name) || name.includes(String(p.companyName))))
  return hit ? `系统里已有「${hit.companyName}」(长期合作客户),这可能是老客户,建议改选「老客户」从长期合作里挑。` : ''
})

// 办理资料:按印章状态/外区域/经办人动态出上传位;已传的存入 docs 这个map,保存时序列化进 form.documents
const docs = ref<Record<string, { fileId: string; fileName: string }>>({})
const simpleFile = (fileId?: string | number, fileName = '附件'): AttachmentRef => ({ fileId, fileName })
const isSealAllowedFile = (file?: File) => {
  if (!file) return false
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return type === 'image/jpeg' || type === 'application/pdf' || /\.(jpe?g|pdf)$/i.test(name)
}
const uploadSealAttachment = async (file?: File) => {
  if (!isSealAllowedFile(file)) {
    ElMessage.warning(SEAL_UPLOAD_TIP)
    return null
  }
  const res: any = await fileInfoApi.upload(file!)
  return res?.data ?? res
}
const filePreview = ref<{ visible: boolean; title: string; url: string; type: AttachmentPreview['type']; file?: AttachmentRef }>({
  visible: false,
  title: '',
  url: '',
  type: 'other'
})
const clearPreview = () => {
  if (filePreview.value.url) URL.revokeObjectURL(filePreview.value.url)
  filePreview.value = { visible: false, title: '', url: '', type: 'other' }
}
const previewAttachment = async (file: AttachmentRef) => {
  try {
    clearPreview()
    const preview = await createAttachmentPreview(file)
    if (!preview) return
    filePreview.value = { visible: true, title: preview.title, url: preview.url, type: preview.type, file }
  } catch { ElMessage.error('预览失败') }
}
const downloadFile = async (file: AttachmentRef) => {
  try { await downloadAttachment(file) }
  catch { ElMessage.error('下载失败') }
}
const docSlots = computed(() => {
  const slots: { key: string; label: string; required: boolean }[] = [
    { key: 'license', label: '营业执照/电子执照', required: true }
  ]
  const outRegion = form.value.sealCity && form.value.sealCity !== '杭州'
  slots.push({ key: 'legalHalfBody', label: '法人靠白墙半身照', required: !!outRegion })
  const st = form.value.sealStatus
  if (st === '变更刻章') {
    slots.push({ key: 'changeForm', label: '变更情况表(浙里办)', required: true })
    slots.push({ key: 'changeReapply', label: '变更后重新刻章申请及情况说明', required: true })
  }
  if (st === '损坏重刻') slots.push({ key: 'damageDesc', label: '损坏说明及重刻申请', required: true })
  if (st === '遗失声明') {
    slots.push({ key: 'publicNotice', label: '浙里办电子公告声明', required: true })
    slots.push({ key: 'lostReapply', label: '印章遗失情况说明及重刻申请', required: true })
  }
  if (st === '遗失登报') {
    slots.push({ key: 'newspaper', label: '报纸照片(登报后)', required: false })
    slots.push({ key: 'lostReapply', label: '印章遗失情况说明及重刻申请', required: true })
  }
  if (form.value.handlerIsLegal === 0) {
    slots.push({ key: 'agentId', label: '经办人身份证', required: true })
    slots.push({ key: 'agentHalfBody', label: '经办人半身照', required: true })
    slots.push({ key: 'authLetter', label: '授权委托说明', required: true })
  }
  return slots
})
const uploadDoc = async (key: string, options: any) => {
  try {
    const data = await uploadSealAttachment(options.file)
    if (!data) return
    docs.value = { ...docs.value, [key]: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name } }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
// 问题3:其他资料(备用位,可多张)。用 other- 前缀存 docs,与固定资料位/粘贴图片互不冲突
let otherSeq = 0
const uploadOther = async (options: any) => {
  try {
    const data = await uploadSealAttachment(options.file)
    if (!data) return
    otherSeq++
    docs.value = { ...docs.value, [`other-${otherSeq}`]: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name } }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
const otherDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith('other-')).map(([k, v]) => ({ key: k, ...(v as any) })))

// A5 备案查询(政府站无公开API,改为开链接手动查/回填)
const RECORD_QUERY_URL = 'https://yzgl.gat.zj.gov.cn/page/3/ch02/index.html'
const openRecordQuery = () => window.open(RECORD_QUERY_URL, '_blank')

// A5 微信复制粘贴上传:复制图片后在弹窗内 Ctrl+V 即上传(等效"从微信拖进来")
let pasteSeq = 0
const onWindowPaste = async (e: ClipboardEvent) => {
  // 仅在新增/编辑弹窗打开时拦截粘贴
  if (!dialog.value.visible) return
  const cd = e.clipboardData
  if (!cd) return
  // 收集剪贴板里的所有图片(items 优先,兼容部分浏览器走 files)
  const images: File[] = []
  const items = cd.items
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (it.kind === 'file' && it.type && it.type.startsWith('image/')) {
        const f = it.getAsFile()
        if (f) images.push(f)
      }
    }
  }
  if (!images.length && cd.files && cd.files.length) {
    for (let i = 0; i < cd.files.length; i++) {
      const f = cd.files[i]
      if (f && f.type && f.type.startsWith('image/')) images.push(f)
    }
  }
  if (!images.length) return
  // 命中图片就阻止默认粘贴行为,逐个走已有上传逻辑
  e.preventDefault()
  for (const file of images) {
    try {
      const data = await uploadSealAttachment(file)
      if (!data) continue
      pasteSeq++
      docs.value = { ...docs.value, [`paste-${Date.now()}-${pasteSeq}`]: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || file.name || `粘贴图片${pasteSeq}` } }
      ElMessage.success('已粘贴')
    } catch { ElMessage.error('粘贴上传失败') }
  }
}
const pastedDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith('paste-')).map(([k, v]) => ({ key: k, ...(v as any) })))
const removeDoc = (key: string) => { const d = { ...docs.value }; delete d[key]; docs.value = d }

// 运营成本自动估算
const sealCount = computed(() => sealTypeList.value.length)
// 外区域备案费:默认按当前合作最贵的进备案价 25 元/个估算;可在表单里手动改成实际成本
const outRegionFee = computed(() => {
  const manual = Number((form.value as any).outRegionFee)
  if (Number.isFinite(manual) && manual > 0) return manual
  return form.value.sealCity && form.value.sealCity !== '杭州' ? 25 * sealCount.value : 0
})
const deliveryFee = computed(() => DELIVERY_FEE[form.value.deliveryType || ''] || 0)
// 多材质:取所选材质里单价最高的作为每个印章的耗材成本估算
const materialCost = computed(() => {
  const maxUnit = sealMaterialList.value.reduce((mx, m) => Math.max(mx, MATERIAL_COST[m] || 0), 0)
  return maxUnit * sealCount.value
})
const opCostTotal = computed(() => outRegionFee.value + deliveryFee.value + materialCost.value + Number(form.value.publishFee || 0))

const onRegDate = () => {
  const d = String(form.value.regDate || '')
  if (d.length >= 7) { form.value.billYear = d.slice(0, 4); form.value.billMonth = String(Number(d.slice(5, 7))) }
}
const onMaterial = () => {
  // 问题1:材质变了,清掉材质已取消的"材质-类型"组合(回墨×掉→回墨名下的类型全部自动取消)
  const mats = sealMaterialList.value
  sealTypeList.value = sealTypeList.value.filter((c) => mats.some((m) => c.startsWith(m + '-')))
}

// 萝卜章二次确认弹窗:确认刻制返回 true,点"否"返回 false
const confirmLuobo = () => ElMessageBox.confirm(
  '萝卜章属于私下刻制,无印章编码,无备案记录,官方系统查不到,不具备合法效力。非不可抗因素禁止刻制。刻制后浙杭刻章店不承担任何责任,后果刻章单位自负。是否确认刻制?',
  '温馨提示',
  { confirmButtonText: '确认刻制', cancelButtonText: '否', type: 'warning' }
).then(() => true).catch(() => false)

// 萝卜章二次确认:选中时弹窗警示;取消则回退到上一个值
const onSealStatus = async (val: string) => {
  if (val === '萝卜章') {
    if (await confirmLuobo()) {
      luoboConfirmed.value = true
      prevSealStatus = val
      // 192:萝卜章无备案记录,默认置为"不备案"
      form.value.isRecord = 0
    } else {
      // 用户点"否":回退到上一个值并清除标记
      form.value.sealStatus = prevSealStatus || ''
      luoboConfirmed.value = false
    }
  } else {
    luoboConfirmed.value = false
    prevSealStatus = val
  }
}
// 备案状态选"萝卜章"同样触发警示;点"否"则清空备案状态
const onRecordStatus = async (val: string) => {
  if (val === '萝卜章') {
    // 192:萝卜章无备案记录,默认置为"不备案"
    if (await confirmLuobo()) { luoboConfirmed.value = true; form.value.isRecord = 0 }
    else form.value.recordStatus = ''
  }
}
const onBizType = () => {
  if (form.value.bizType === 'new') { form.value.partnerId = undefined }
  else if (!partners.value.length) loadPartners()
}
const onPickPartner = (id: number) => {
  const p = partners.value.find((x) => x.id === id)
  if (p) {
    form.value.companyName = p.companyName
    form.value.phone = form.value.phone || p.phone
    form.value.legalPerson = form.value.legalPerson || p.contact || p.decisionMaker
    // 老客户带出:业务负责人→业绩归属人;默认邮寄方式/地址
    if (p.bizOwnerName) form.value.ownerName = p.bizOwnerName
    if (p.mailMethod && !form.value.deliveryType) form.value.deliveryType = p.mailMethod
    if (p.mailAddress && !form.value.address) { form.value.address = p.mailAddress; form.value.isMail = 1 }
  }
}

const openForm = (row?: SealOrder) => {
  if (row) {
    form.value = { ...row }
    sealTypeList.value = splitTypes(row.sealTypes)
    sealMaterialList.value = splitTypes(row.sealMaterial)
    luoboConfirmed.value = !!(row as any).luoboConfirmed
    prevSealStatus = row.sealStatus || ''
    docs.value = parseDocuments(row.documents)
    if (row.bizType === 'old') loadPartners()
  } else {
    const me = userStore.userInfo?.name || userStore.userInfo?.nickName || userStore.userInfo?.username || ''
    const initial = props.initialData || {}
    const prefill: Partial<SealOrder> = {}
    if (initial.regDate && initial.regDate >= todayStr()) prefill.regDate = initial.regDate
    if (initial.companyName) prefill.companyName = initial.companyName
    if (initial.phone) prefill.phone = initial.phone
    if (initial.address) prefill.address = initial.address
    if (initial.ownerName) prefill.ownerName = initial.ownerName
    if (initial.perfDept && PERF_DEPTS.includes(initial.perfDept)) prefill.perfDept = initial.perfDept
    form.value = { regDate: todayStr(), bizType: 'new', sealCity: '杭州', recordStatus: '', isMail: 0, isRecord: 0, isShipped: 0, isDelivered: 0, handlerIsLegal: 1, isWePublish: 0, status: 'pending', fee: 0, ownerName: me, ...prefill }
    sealTypeList.value = []
    sealMaterialList.value = []
    luoboConfirmed.value = false
    prevSealStatus = ''
    docs.value = {}
    onRegDate()
    restoreDraft()
  }
  dialog.value = { visible: true, saving: false }
}

const onDialogClosed = () => {
  if (props.createOnly) emit('closed')
}

// 草稿自动保存:防"填一半误关数据全没"。只在新增态(无 id)存草稿
const DRAFT_KEY = 'seal_draft'
const restoreDraft = () => {
  if (hasImpersonationSessionMarker()) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object') return
    form.value = { ...form.value, ...d.form }
    sealTypeList.value = Array.isArray(d.sealTypeList) ? d.sealTypeList : []
    sealMaterialList.value = Array.isArray(d.sealMaterialList) ? d.sealMaterialList : []
    docs.value = d.docs && typeof d.docs === 'object' ? d.docs : {}
    luoboConfirmed.value = !!d.luoboConfirmed
    prevSealStatus = form.value.sealStatus || ''
    ElMessage.info('已恢复上次未提交的草稿')
  } catch { /* 草稿损坏忽略 */ }
}
const clearDraft = () => {
  if (hasImpersonationSessionMarker()) return
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}
// 编辑表单时把内容深度写入草稿;仅在弹窗可见且为新增态(无 id)时保存
watch([form, sealTypeList, sealMaterialList, docs, luoboConfirmed], () => {
  if (!dialog.value.visible || form.value.id || hasImpersonationSessionMarker()) return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      form: form.value, sealTypeList: sealTypeList.value, sealMaterialList: sealMaterialList.value, docs: docs.value, luoboConfirmed: luoboConfirmed.value
    }))
  } catch { /* 容量满等忽略 */ }
}, { deep: true })

const uploadId = async (side: 'front' | 'back', options: any) => {
  try {
    const data = await uploadSealAttachment(options.file)
    if (!data) return
    const id = data?.id
    if (side === 'front') form.value.idCardFront = id != null ? String(id) : options.file.name
    else form.value.idCardBack = id != null ? String(id) : options.file.name
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
// 删除身份证正/反面:置空字符串(不能用 null,否则后端 updateById 跳过该字段删不掉)
const removeId = (side: 'front' | 'back') => {
  if (side === 'front') form.value.idCardFront = ''
  else form.value.idCardBack = ''
  ElMessage.success('已删除')
}
// 问题5:客户支付宝收款码(退款/返点用),存 fileId 到 form.customerAlipayQr
const uploadAlipayQr = async (options: any) => {
  try {
    const data = await uploadSealAttachment(options.file)
    if (!data) return
    form.value.customerAlipayQr = data?.id != null ? String(data.id) : options.file.name
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
// 删除支付宝收款码:置空字符串(同上,避免后端跳过 null 字段)
const removeAlipayQr = () => { form.value.customerAlipayQr = ''; ElMessage.success('已删除') }
// 190:收款凭证(收款截图/转账凭证),复用 docs 机制存入 form.documents(已有字段),无需新增数据库列
const uploadPayVoucher = async (options: any) => {
  try {
    const data = await uploadSealAttachment(options.file)
    if (!data) return
    docs.value = { ...docs.value, payVoucher: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name } }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}

const submit = async () => {
  if (!form.value.companyName || !form.value.regDate) { ElMessage.warning('请填写提单日期和公司名称'); return }
  if (!form.value.perfDept) { ElMessage.warning('请选择业绩归属部门'); return }
  form.value.sealTypes = sealTypeList.value.join(',')
  form.value.sealMaterial = sealMaterialList.value.join(',')
  ;(form.value as any).luoboConfirmed = luoboConfirmed.value ? 1 : 0
  form.value.documents = JSON.stringify(docs.value)
  form.value.opCostTotal = opCostTotal.value
  onRegDate()
  dialog.value.saving = true
  try {
    if (form.value.id) await sealOrderApi.update(form.value)
    else await sealOrderApi.create(form.value)
    clearDraft()
    ElMessage.success('已保存'); emit('saved'); dialog.value.visible = false
    if (!props.createOnly) loadData()
  } catch { ElMessage.error('保存失败') } finally { dialog.value.saving = false }
}

// 多单位刻章:保存当前单位,保留对接人级信息、清空单位级,继续加同一对接人的下一个单位
const submitAndNext = async () => {
  if (!form.value.companyName || !form.value.regDate) { ElMessage.warning('请填写提单日期和公司名称'); return }
  if (!form.value.perfDept) { ElMessage.warning('请选择业绩归属部门'); return }
  form.value.sealTypes = sealTypeList.value.join(',')
  form.value.sealMaterial = sealMaterialList.value.join(',')
  ;(form.value as any).luoboConfirmed = luoboConfirmed.value ? 1 : 0
  form.value.documents = JSON.stringify(docs.value)
  form.value.opCostTotal = opCostTotal.value
  onRegDate()
  dialog.value.saving = true
  try {
    await sealOrderApi.create(form.value)
    clearDraft()
    emit('saved')
    ElMessage.success('已保存,继续加同对接人的下一个单位')
    const keep: SealOrder = { regDate: form.value.regDate, perfDept: form.value.perfDept, ownerName: form.value.ownerName, bizType: form.value.bizType, legalPerson: form.value.legalPerson, phone: form.value.phone, payMethod: form.value.payMethod, payAccount: form.value.payAccount }
    form.value = { ...keep, sealCity: '杭州', recordStatus: '', isMail: 0, isRecord: 0, isShipped: 0, isDelivered: 0, handlerIsLegal: 1, isWePublish: 0, status: 'pending', fee: 0 }
    sealTypeList.value = []
    sealMaterialList.value = []
    luoboConfirmed.value = false
    prevSealStatus = ''
    docs.value = {}
    if (!props.createOnly) loadData()
  } catch { ElMessage.error('保存失败') } finally { dialog.value.saving = false }
}

const remove = async (row: SealOrder) => {
  try { await ElMessageBox.confirm(`确定删除「${row.companyName}」的这条提单?`, '删除', { type: 'warning' }) } catch { return }
  try { await sealOrderApi.remove(row.id!); ElMessage.success('已删除'); loadData() } catch { ElMessage.error('删除失败') }
}

const parseDocuments = (s?: string): Record<string, { fileId: string; fileName: string }> => {
  if (!s) return {}
  try { return JSON.parse(s) || {} } catch { return {} }
}
const splitTypes = (s?: string) => (s ? s.split(',').filter(Boolean) : [])
// 材质可能是逗号串(多材质),列表显示用顿号
const fmtMaterial = (s?: string) => (s ? s.split(',').filter(Boolean).join('、') : '')
const statusLabel = (s?: string) => statusOptions.find((o) => o.value === s)?.label || '待刻章'
const statusType = (s?: string) => (({ lack: 'danger', recorded: 'info', pending: 'info', engraved: 'primary', mailed: 'warning', taken: 'success', done: 'success' } as any)[s || ''] || 'info')

// 列表内联改状态:改完直接调更新接口保存整行
const onRowStatusChange = async (row: any) => {
  row._statusSaving = true
  try {
    await sealOrderApi.update(row)
    ElMessage.success('状态已更新')
  } catch { ElMessage.error('状态更新失败'); loadData() } finally { row._statusSaving = false }
}
const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

onMounted(() => {
  loadPartners()
  if (props.createOnly) openForm()
  else loadData()
  window.addEventListener('paste', onWindowPaste)
})
onBeforeUnmount(() => window.removeEventListener('paste', onWindowPaste))
</script>

<style scoped>
.seal-reg { padding: 16px 18px; }
.seal-reg--embedded { padding: 4px 0 0; }
.sr-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.sr-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.sr-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.sr-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.sr-search { width: 200px; }
.sr-filter { width: 120px; }
.sr-stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.sr-stat { flex: 1; min-width: 110px; display: flex; flex-direction: column; align-items: center; padding: 12px 8px; border-radius: 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); }
.sr-stat-num { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary); }
.sr-stat-label { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 2px; }
.sr-stat--fee .sr-stat-num { color: var(--el-color-success); }
.sr-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
.sr-type-groups { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.sr-type-group { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.sr-type-mat { flex: 0 0 auto; min-width: 40px; padding: 4px 12px; border-radius: 6px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-weight: 700; font-size: 13px; line-height: 24px; }
.sr-type-checks { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.sr-id-uploads { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.sr-doc-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.sr-doc-slot { display: inline-flex; flex-direction: column; gap: 4px; max-width: 100%; }
.sr-pasted { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
.sr-file-actions,
.sr-file-chip { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; padding: 2px 6px; border: 1px solid var(--el-border-color); border-radius: 6px; background: var(--el-fill-color-lighter); }
.sr-file-name { max-width: 180px; border: 0; padding: 0 2px; background: transparent; color: var(--el-color-primary); font-size: 12px; line-height: 22px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.sr-preview { min-height: 320px; display: flex; align-items: center; justify-content: center; }
.sr-preview-img { max-width: 100%; max-height: 72vh; object-fit: contain; }
.sr-preview-frame { width: 100%; height: 72vh; border: 1px solid var(--el-border-color); border-radius: 6px; }
.sr-cost { display: flex; gap: 18px; flex-wrap: wrap; padding: 10px 14px; background: var(--el-fill-color-light); border-radius: 8px; font-size: 13px; color: var(--el-text-color-secondary); }
.sr-cost b { color: var(--el-text-color-primary); }
.sr-cost-total b { color: var(--el-color-danger); }
.sr-hint { display: block; margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); }
</style>
