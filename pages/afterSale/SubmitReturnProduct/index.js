import afterSale from '../../../utils/request/afterSale.js'
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    proposal: ['我要退款', '我要退货并退款'], //申请售后的方式
    pursueReason: ['跟卖家协商,双方同意', '买错,不想要了', '商品质量有问题', '没有收到货', '其他原因'], //售后原因
    imgs: [],
    imageList: [],
    count: 1,
    disable: true
  },
  //获取售后方式的索引
  bindProposalChange: function(e) {
    this.setData({
      proposalIndex: e.detail.value
    })
  },
  //获取售后原因的索引
  bindPursueReason: function(e) {
    this.setData({
      idx: e.detail.value
    })
  },
  //获取可退金额
  getTotalMoney: function(e) {
    this.setData({
      totalMoney: e.detail.value
    })
  },
  //获取详细原因
  getContent: function(e) {
    this.setData({
      content: e.detail.value
    })
  },
  //选择图片举证
  chooseImage: function() {
    var that = this
    var imgList = []
    var img = []
    var num = this.data.num
    wx.chooseImage({
      count: this.data.count,
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length == 1) {
          app.uploadFile(tempFilePaths[0], function(req) {
            var data = JSON.parse(req.data)
            that.setData({
              fullUrl: data.data.fullUrl,
              tempFilePaths: tempFilePaths[0]
            })
            imgList.push(tempFilePaths[0].toString())
            img.push(data.data.fullUrl)
            that.data.imageList = imgList.concat(that.data.imageList)
            that.data.imgs = img.concat(that.data.imgs)
            that.setData({
              imgLists: that.data.imageList
            })
          })
        } else {
          wx.showToast({
            title: '单次只能上传一张图片',
            icon: 'none'
          })
        }
      }
    })
  },

  //获取要售后的商品
  getOrderSale: function(data) {
    var self = this
    var afterId = this.data.afterId
    afterSale.getApplyAfterSale(data, function(res) {
      if (res.data.data.imgs) {
        var imageList = res.data.data.imgs.split(",")
      }
      if (res.data.data.isShip) {
        self.setData({
          proposal: ['我要退款', '我要退货并退款'], //申请售后的方式
        })
      } else {
        if (afterId) {
          self.setData({
            proposal: ['我要退款'], //申请售后的方式
            proposalIndex: 0,
          })
        } else {
          self.setData({
            proposal: ['我要退款'], //申请售后的方式
          })
        }
      }
      if (afterId) {
        if (res.data.data.isShip) {
          self.setData({
            proposal: ['我要退款', '我要退货并退款'], //申请售后的方式
            proposalIndex: res.data.data.selectWay
          })
        } else {
          self.setData({
            proposal: ['我要退款'], //申请售后的方式
            proposalIndex: 0,
          })
        }
        self.setData({
          orderDetail: res.data.data,
          idx: res.data.data.selectReason,
          content: res.data.data.content,
        })
      } else {
        if (res.data.data.isShip) {
          self.setData({
            proposal: ['我要退款', '我要退货并退款'], //申请售后的方式
          })
        } else {
          self.setData({
            proposal: ['我要退款'], //申请售后的方式
          })
        }
        self.setData({
          orderDetail: res.data.data,
          proposalIndex: -1,
          idx: -1
        })
      }

    })
  },

  //提交申请
  submitSale: function() {
    var self = this
    var orderDetail = this.data.orderDetail
    var disable = this.data.disable
    if (this.isEmpty() && disable) {
      this.setData({
        disable: false
      })
      var data = {
        orderid: orderDetail.orderId, //订单号
        products: orderDetail.productName, //货品名称 
        returnNum: orderDetail.productNum, //货品数量
        pics: orderDetail.pics, // 货品图片
        bns: orderDetail.bns, //货号
        content: this.data.content, //售后详细原因
        imgs: this.data.imgs.join(",") || '', //图片举证
        mobile: orderDetail.mobile, //联系人手机
        price: orderDetail.price, //退款金额
        goodsid: orderDetail.goodsId, //商品Id
        selectway: this.data.proposalIndex, //售后方式
        selectreason: this.data.idx, //售后原因
        afterid: this.data.afterId, //售后id
        supplierid: orderDetail.supplierid || 0, //供应商id
        unionorderid: orderDetail.unionOrderid, //联合单号
        itemid: 0, //订单itemId(供应商使用)
        productid: orderDetail.productId, //货品id
        costfreight: orderDetail.costFreight //结算金额-所占运费
      }
      afterSale.applyAfterSale(data, function(res) {
        self.setData({
          disable: true
        })
        if (res.data.code == 200) {
          wx.showToast({
            title: '申请成功',
            icon: 'success',
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
    }
  },

  /**
   * 验证申请方式和申请原因 以及详细原因 是否选择或者填写
   */
  isEmpty: function() {
    if (!(this.data.proposalIndex >= 0)) {
      wx.showToast({
        title: '请选择申请方式',
        icon: 'none'
      })
      return false
    }
    if (!(this.data.idx >= 0)) {
      wx.showToast({
        title: '请选择申请原因',
        icon: 'none'
      })
      return false
    }
    if (!this.data.content) {
      wx.showToast({
        title: '请输入详细原因',
        icon: 'none'
      })
      return false
    }
    return true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      afterId: options.afterId || ''
    })
    this.getOrderSale({
      orderId: options.orderId,
      productId: options.productId,
      afterId: options.afterId || ''
    })
  }
})