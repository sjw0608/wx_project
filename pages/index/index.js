import {
  collection,
  windowHeight,
  setRefermid,
  getRefermid
} from '../../utils/common.js'

import config from '../../config.js'
import home from '../../utils/request/home.js'
import collectgoods from '../../utils/request/collectgoods.js'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    refermid: 0, //引导人ID
    bannerItems: [],
    scrollIntoView: 1,
    category: [],
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    category: [],
    currentCategory: [],
    goodsItems: [],
    specialItems: [],
    filterTap: 1,
    mask: false,
    windowHeight: windowHeight(),
    hidden: false,
    backTopValue: false,
    page: 1,
    pageSize: 20
  },

  imageLoad: function(e) {
    var $width = e.detail.width
    var $height = e.detail.height
    var ratio = $width / $height
    this.setData({
      imgHeight: $height / ratio
    })
  },

  _goodsDetilList: function(e) {
    var index = e.currentTarget.dataset.index
    var bannerItems = this.data.bannerItems
    if (bannerItems[index].linktype == 0) {
      wx.navigateTo({
        url: '../goodsdetails/details?goodsid=' +
          bannerItems[index].linkdata + '&refermid=' + this.data.refermid
      })
    } else if (bannerItems[index].linktype == 1) {
      wx.navigateTo({
        url: '../goodslist/goods-list?keyword=' + bannerItems[index].linkdata
      })
    }

  },

  _goodsDetilList2: function(e) {
    var idx = e.currentTarget.dataset.idx
    var specialItems = this.data.specialItems
    if (specialItems[idx].linktype == 0) {
      wx.navigateTo({
        url: '../goodsdetails/details?goodsid=' +
          specialItems[idx].linktype + '&refermid=' + this.data.refermid
      })
    } else {
      var key = specialItems[idx].linkdata || ''
      wx.navigateTo({
        url: '../goodslist/goods-list?keyword=' + key
      })
    }

  },

  // 监听滚动条坐标
  onPageScroll: function(e) {
    var that = this
    var scrollTop = e.scrollTop
    var backTopValue = scrollTop > 500 ? true : false
    that.setData({
      backTopValue: backTopValue
    })
  },

  // 滚动到顶部
  backTop: function() {
    // 控制滚动
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  // 点击标题切换当前页时改变样式
  swichNav: function(e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    var cur = e.currentTarget.dataset.current
    if (this.data.currentTab == cur) {
      return false
    }
    this.checkCor(cur)
    this.setData({
      currentCategory: e.currentTarget.dataset.item.child,
      goodsItems: this.data.goodsItems,
      filterTap: 1
    })
  },
  //点击商品筛选事件
  clickfilterTap: function(e) {
    var cur = e.currentTarget.dataset
    if (cur.type == 4) {}
    this.setData({
      filterTap: cur.type
    })
  },
  //点击收藏
  clickFavTab: function(e) {
    var self = this
    var item = e.currentTarget.dataset.item
    var index = e.currentTarget.dataset.index
    var isFav = e.target.dataset.isfav
    var _items = []
    if (!isFav) {
      collectgoods.addCollection({
          goodsId: e.target.dataset.goodsid
        },
        function(res) {
          wx.showToast({
            title: '收藏成功',
            success: function() {
              _items = self.data.goodsItems
              _items[index].IsFav = !isFav
              self.setData({
                goodsItems: _items
              })
            }
          })
        }
      )
    } else {
      collectgoods.addCollection({
          goodsId: e.target.dataset.goodsid
        },
        function(res) {
          wx.showToast({
            title: '取消成功',
            success: function() {
              _items = self.data.goodsItems
              _items[index].IsFav = !isFav
              self.setData({
                goodsItems: _items
              })
            }
          })
        }
      )
    }
  },
  //商品详情页面
  goodsDetails: function(e) {
    wx.navigateTo({
      url: '../goodsdetails/details?goodsid=' +
        e.currentTarget.dataset.goodsid + '&refermid=' + this.data.refermid
    })
  },
  //设置tab标题滚动
  checkCor: function(cur) {
    if ((this.data.currentTab > 3 || cur > 3) && this.data.currentTab < cur) {
      this.setData({
        scrollLeft: cur * 50
      })
    } else if (this.data.currentTab > cur && cur > 3) {
      this.setData({
        scrollLeft: this.data.scrollLeft - (this.data.scrollLeft - cur * 50)
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }

    this.setData({
      currentTab: cur
    })
  },
  // 跳转至收藏夹
  _goCollectGoods: function() {
    var userInfo = app.globalData.userInfo || ''
    if (userInfo) {
      wx.navigateTo({
        url: '../collectgoods/collectgoods'
      })
    } else {
      wx.showModal({
        content: '授权查看更多',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../scope/index',
            })
          }
        }
      })
    }
  },
  // search搜索
  searchShop(e) {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  _goList: function(e) {
    wx.navigateTo({
      url: '../goodslist/goods-list'
    })
  },
  //小店预览
  storeInfo: function() {
    var self = this
    home.storeInfo(function(res) {
      if (res.data.code == 200) {
        self.setData({
          storeInfo: res.data.data
        })
        if (res.data.data) {
          wx.setNavigationBarTitle({
            title: res.data.data.name,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this
    var _refermid = getRefermid()
    self.setData({
      refermid: _refermid == 0 ? (options.refermid || 0) : _refermid
    })
    setRefermid(self.data.refermid)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var self = this
    this.storeInfo()
    //获取首页推荐
    home.homeRecommend(function(res) {
      self.setData({
        bannerItems: res.bannerItems,
        specialItems: res.specialItems
      })
    })
    //获取推荐商品
    home.goodsList({
      page: self.data.page,
      pageSize: self.data.pageSize
    }, function(res) {
      self.setData({
        goodsItems: res.goodsItems,
        loading: false
      })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
    var self = this
    //获取首页推荐
    home.homeRecommend(function(res) {
      self.setData({
        bannerItems: res.bannerItems,
        specialItems: res.specialItems
      })
    })
    //获取推荐商品
    home.goodsList({
      page: self.data.page,
      pageSize: self.data.pageSize
    }, function(res) {
      self.setData({
        goodsItems: res.goodsItems,
        loading: false
      })
    })
  },

  onReachBottom: function() {
    var self = this
    this.setData({
      loading: true
    })
    var page = this.data.page + 1
    var _goodsItems = this.data.goodsItems
    home.goodsList({
        page: page,
        pageSize: self.data.pageSize
      },
      function(res) {
        if (res.goodsItems.length > 0) {
          self.setData({
            loading: false,
            goodsItems: _goodsItems.concat(res.goodsItems),
            page: page
          })
        } else {
          wx.showToast({
            title: '没有更多数据',
            icon: 'none'
          })
          self.setData({
            loading: false
          })
        }
      }
    )
  },

  /**
   * 用户点击右上角分享
   */

  onShareAppMessage: function() {
    var shareData = {
      title: '健康生活每一天',
      desc: '',
      path: '/pages/index/index?refermid=' + app.globalData.userId
    }
    return shareData
  },
  /**
   * 商品列表
   */

  _goGoodsList: function(e) {
    // var _item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../goodslist/goods-list'
    })
    this.setData({
      mask: false
    })
  },
  /**
   *
   */
  maskTouchStart: function(e) {
    this.setData({
      mask: false
    })
  },
  /**
   * 显示所有类目
   */
  showAllCategory: function() {
    this.setData({
      mask: true
    })
  },
  hideAllCategory: function() {
    this.setData({
      mask: false
    })
  },
  binderrorimg: function(e) {
    var idx = e.target.dataset.errorimg //获取循环的下标
    var goodList = this.data.goodsItems
    goodList[idx].PicUrl = '../../images/avator.png'
    this.setData({
      goodList: goodList
    })
  },
  onShareAppMessage: function() {}
})