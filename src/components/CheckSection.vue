<script setup>
import { computed } from "vue";
import { SECTION_TAG_TYPES, TIERS, TIER_TAG_TYPES } from "@/data/sections";

const props = defineProps({
  section: { type: Object, required: true },
  filter: { type: String, default: "all" },
});

const emit = defineEmits(["toggle"]);

/** 备注语气 → Element 徽标语义色 */
const NOTE_TAG_TYPES = {
  ok: "success",
  warn: "danger",
  info: "primary",
};

function matchTier(tier) {
  if (props.filter === "a") return tier === "a";
  if (props.filter === "ab") return tier === "a" || tier === "b";
  return true;
}

const rows = computed(() => props.section.items.filter((item) => matchTier(item.tier)));

function rowClass({ row }) {
  return row.done ? "is-checked-row" : "";
}
</script>

<template>
  <el-card class="stack" shadow="never">
    <template #header>
      <div class="panel-head">
        <el-tag :type="SECTION_TAG_TYPES[section.key]" effect="dark" size="small" round>
          {{ section.tag }}
        </el-tag>
        <span class="panel-title">{{ section.title }}</span>
        <span class="muted small mono">
          {{ section.done }}/{{ section.total }}
          <template v-if="filter !== 'all'">（显示 {{ rows.length }}）</template>
        </span>
      </div>
    </template>

    <p v-if="section.desc" class="desc" style="margin: 0 0 12px">{{ section.desc }}</p>

    <el-table :data="rows" row-key="id" :row-class-name="rowClass">
      <el-table-column label="✓" width="58" align="center">
        <template #default="{ row }">
          <el-checkbox
            :model-value="row.done"
            :aria-label="row.title"
            @change="(value) => emit('toggle', row.id, value)"
          />
        </template>
      </el-table-column>

      <el-table-column label="性价比" width="146">
        <template #default="{ row }">
          <el-tag :type="TIER_TAG_TYPES[row.tier]" effect="plain" size="small">
            {{ TIERS[row.tier].stars }} {{ TIERS[row.tier].label }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="项目" min-width="190">
        <template #default="{ row }">
          <span
            class="task-title"
            role="checkbox"
            tabindex="0"
            :aria-checked="row.done"
            @click="emit('toggle', row.id, !row.done)"
            @keydown.enter.prevent="emit('toggle', row.id, !row.done)"
            @keydown.space.prevent="emit('toggle', row.id, !row.done)"
          >
            {{ row.title }}
          </span>
          <span v-if="row.subtitle" class="task-sub">{{ row.subtitle }}</span>
        </template>
      </el-table-column>

      <el-table-column label="产出参考" width="148">
        <template #default="{ row }">
          <span class="pay">{{ row.pay }}</span>
        </template>
      </el-table-column>

      <el-table-column label="说明" min-width="320">
        <template #default="{ row }">
          <div class="desc">{{ row.desc }}</div>
          <div v-if="row.notes?.length" class="note-row">
            <el-tag
              v-for="(note, index) in row.notes"
              :key="index"
              :type="NOTE_TAG_TYPES[note.tone] || 'info'"
              size="small"
              effect="light"
            >
              {{ note.text }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
