<script setup>

import product_list from '../components/product_list.vue'
</script>

<template>
  <main v-if="ready">
    <div class="box">
      <div class="input">
        <label>关键词&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" v-model="newItem.name"></label>
        <label>网址&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" v-model="newItem.url"></label>
        <label>自动抓取间隔（秒）&nbsp;&nbsp;&nbsp;&nbsp;<input type="number" v-model="newItem.polling"></label>
        <button @click="addItem">添加</button>
      </div>

      <ul class="show">
        <li v-for="(item, index) in setting.keyword" :key="index">
          <button @click="removeItem(index)">删除</button>
          <label v-show="setting.auto_update">
        自动抓取间隔：
        <input type="number" v-model="item.polling">
      </label>
        关键词：
        <span style="color: rgb(194, 253, 179);">{{ item.name }}</span>
        <br/>
          网址:
          <span style="color: rgb(140, 161, 255);">{{ item.url }}</span>


          <div>

          </div>
        </li>
      </ul>

      <div class="option">
        <label>
          <input type="checkbox" v-model="setting.auto_update">
          自动抓取
        </label>
        
        <label>
          <input type="checkbox" v-model="setting.new_product_notice">
        新商品提醒
        </label>
      <button @click="saveCfg">保存设置</button>
      <button @click="resetCfg">重置设置</button>
      </div>
    </div>

  </main>
</template>
<script>
export default {
  data() {
    return {
      ready: false,
      newItem: {
        name: "",
        url: "",
        polling: 600,
        latestUpdate: 0,
        nextUpdate:0
      },

      setting: {

      } // 用于存放设置

    }
  },
  watch: {
    selected: function (val) {
      console.log(val)
      this.products.forEach((e, i) => {
        if (e.keyword == val) {
          this.product = e.data;
        }
      });
    }
  },
  computed: {

  },

  methods: {
    resetCfg() {
      this.setting = {
        "new_product_notice": false,
        "keyword": [
          {
            "name": "Test(keyword:Hello)",
            "latestUpdate": 0,
            "polling": 600,
            "url": "https://www.farfetch.cn/hk/shopping/men/search/items.aspx?q=hello"
          }
        ],
        "auto_update": false

      }
      this.saveCfg()
    },
    saveCfg() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify(this.setting);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("./settings", requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log(result);
          alert("保存成功");
        })
        .catch(error => console.log('error', error));
    },
    addItem() {
      if (this.newItem) {
        this.newItem.url
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlRegex.test(this.newItem.url)) {
          alert("网址格式不正确\n请检查后重新输入");
          return;
        }
        if (!this.setting.keyword.some(item => item.name === this.newItem.name || item.url === this.newItem.url)) {
          this.setting.keyword.push(this.newItem);
          this.newItem = {
            name: "",
            url: ""
          }; // 清空输入框
        } else {
          alert("已存在相同的关键字或网址\n请检查后重新输入");
        }
        // this.setting.keyword.push(this.newItem); // 向列表中添加新元素

      }
    },
    removeItem(index) {
      confirm("确定要删除吗？") && this.setting.keyword.splice(index, 1);

    
    },
    getsetting() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      // keyword = keyword.replace(/\s+/g, '+');
      fetch(`./setting`, requestOptions)
        .then(response => response.text())
        .then(result => {
          this.setting = JSON.parse(result);
          console.log("setting", this.setting);
          if (!this.ready) {


            this.ready = true;

          }
        })
        .catch(error => console.log('error', error));
    },



  },
  created() {
    this.getsetting();



  },
  mounted() {
    setInterval(() => {
      if (this.ready) {

      }
    }, 1000);

  },
  updated() {

  }
}
</script>

<style scoped>
.basicButton {
  font-size: 1rem;
  color: #FFF;
  background-color: #666666;
  border: none;
  border-radius: 0.3rem;
  padding: 0.2rem 1rem;
}

main {
  display: flex;
  justify-content: center;
  height: 100vh;
}

.box {
  width: 80vw;
  background-color: #333333;
  color: #FFF;
  display: flex;
  flex-direction: column;
  .input {
    padding: 0 4rem;
    margin: 1rem 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .option {
    padding: 0 4rem;
    margin: 1rem 1rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-content: center;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2rem;
    > button {
      width: 8rem;
    }
  }
  .show {
    padding: 0 5rem;
      > li {
        margin: 0.5rem 0;
        > button {
        margin: 0 2rem 0 0;
      }
    }
  }
}
</style>
