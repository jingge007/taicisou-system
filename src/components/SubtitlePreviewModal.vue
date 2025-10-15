<template>
  <Modal
    v-model="visible"
    title="字幕内容预览"
    class-name="subtitle-preview-modal"
    width="800"
    :footer-hide="false"
    @on-cancel="handleCancel">
    <div v-if="subtitleData" class="subtitle-preview-wrapper">
      <div class="subtitle-stats">
        <span class="subtitle-count-label">字幕条数:</span>
        <span class="subtitle-count-value">{{ subtitleCount }}条</span>
      </div>
      <div class="subtitle-preview-container">
        <pre class="subtitle-content">{{ subtitleData.movieSubtitleFiles }}</pre>
      </div>
    </div>
    <template #footer>
      <Button @click="handleCancel" type="primary">关闭</Button>
    </template>
  </Modal>
</template>

<script>
export default {
  name: "SubtitlePreviewModal",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    subtitleData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    subtitleCount() {
      // 计算字幕条数，兼容不同数据结构
      if (this.subtitleData && this.subtitleData.subtitleData) {
        return this.subtitleData.subtitleData.length;
      } else if (this.subtitleData && this.subtitleData.movieSubtitleFiles) {
        // 通过分割字幕文件内容计算条数
        return this.subtitleData.movieSubtitleFiles ?
          this.subtitleData.movieSubtitleFiles.split('\n\n').filter(item => item.trim() !== '').length : 0;
      }
      return 0;
    }
  },
  methods: {
    handleCancel() {
      this.visible = false;
      this.$emit('close');
    }
  }
};
</script>

<style lang="less" scoped>
.subtitle-preview-wrapper {
  padding: 16px;
}

.subtitle-stats {
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f0faff;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #e8eaec;
}

.subtitle-count-label {
  font-weight: 500;
  color: #515a6e;
  font-size: 14px;
  margin-right: 6px;
}

.subtitle-count-value {
  font-weight: 600;
  color: #2d8cf0;
  font-size: 16px;
}

.subtitle-preview-container {
  border: 1px solid #e8eaec;
  border-radius: 4px;
  padding: 12px;
  background-color: #fff;
  max-height: 500px;
  overflow-y: auto;
}

.subtitle-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #515a6e;
}

.info-text {
  font-size: 13px;
  color: #808695;
}
</style>

<style lang="less">
.subtitle-preview-modal {
  .ivu-modal-header {
    background-color: #f0f2f5;
    border-bottom: 1px solid #e8eaec;
    border-radius: 4px 4px 0 0;

    p {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .ivu-modal-body {
    padding: 0;
  }
}
</style>