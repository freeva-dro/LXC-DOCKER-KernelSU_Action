/**
 * 零一货源站 - 商品分类与页面交互模块
 * 改进点：命名空间封装、错误处理、去重逻辑、代码清晰化
 */
(function(window, $) {
    'use strict';

    // ============================================================
    // 配置常量
    // ============================================================
    var CONFIG = {
        HASH_SALT: 'fe3a113efab1106311c29cd48307724c',
        SCROLL_ANIMATE_DURATION: 400,
        SCROLL_TOP_OFFSET: 80,
        PAYMENT_SUCCESS_DELAY: 500,
        POLL_ORDER_DELAY: 800,
        SUBMIT_QUERY_DELAY: 1000,
        ALIGN_RESIZE_DEBOUNCE: 150,
        DEFAULT_CATEGORY_LABEL: '这里选择分类内容：'
    };

    // ============================================================
    // 分类树数据
    // ============================================================
    var classTree = {
        main: [
            { cid: 9,  name: '三角洲辅助专区',     shopimg: 'assets/img/Product/class_40eb5d8434966389eb1d976e429e4cc0.png' },
            { cid: 38, name: '失控进化辅助专区',   shopimg: 'assets/img/Product/class_4aa58ff8ac26ccea1b55943da6f44a4d.png' },
            { cid: 12, name: '无畏契约辅助专区',   shopimg: 'assets/img/Product/class_4a630dfc8c61eb1a36c66e6fc4b50e0e.png' },
            { cid: 13, name: '绝地求生辅助专区',   shopimg: 'assets/img/Product/class_467a3e23d99650c08f3bd79fd256b69f.png' },
            { cid: 14, name: '穿越火线辅助专区',   shopimg: 'assets/img/Product/class_e0743165834850c2cffbff1bbb2a7b2b.png' },
            { cid: 15, name: '暗区突围辅助专区',   shopimg: 'assets/img/Product/class_58bb576bdc49ba3f520256c584ea8cd7.png' },
            { cid: 16, name: '和平精英PC辅助专区', shopimg: 'assets/img/Product/class_74ce96b52488f3bc5f8af161db31f3e9.png' },
            { cid: 17, name: '逆战未来辅助专区',   shopimg: 'assets/img/Product/class_dba3f0062040fa3ebd03e7879cff5dd0.png' },
            { cid: 19, name: '玄武磐石专区',       shopimg: 'assets/img/Product/class_d428f5f0f2d55658ec7cfbc9d0689fd9.png' },
            { cid: 36, name: '其他游戏专区',       shopimg: 'assets/img/Product/class_f41ac09dea1cdefd64c9168f51e0b739.png' }
        ],
        children: {
            '9':  [ { cid: 10, name: '三角洲多功能专区' }, { cid: 11, name: '三角洲单功能专区' }, { cid: 31, name: '三角洲雷达专区' }, { cid: 35, name: '三角洲周月内部专区' } ],
            '19': [ { cid: 21, name: '一键过玄武磐石专区' } ],
            '12': [ { cid: 23, name: '无畏契约天卡专区' }, { cid: 33, name: '无畏契约周月内部专区' } ],
            '14': [ { cid: 25, name: '穿越火线天卡专区' }, { cid: 30, name: 'CF生化天卡专区' }, { cid: 34, name: 'CF周月内部专区' } ],
            '15': [ { cid: 26, name: '暗区突围天卡专区' }, { cid: 42, name: '暗区突围周月专区' } ],
            '16': [ { cid: 27, name: '和平精英PC天卡专区' } ],
            '17': [ { cid: 28, name: '逆战未来天卡专区' } ],
            '13': [ { cid: 24, name: 'PUBG全功能专区' } ],
            '36': [ { cid: 37, name: 'APXE专区' }, { cid: 41, name: 'CS2专区' } ],
            '38': [ { cid: 39, name: '失控进化多功能专区' } ]
        }
    };

    // ============================================================
    // 页面状态
    // ============================================================
    var state = {
        isModal: false,
        homepage: true,
        currentMainId: 0,
        currentSubId: '',
        isPaymentSuccess: false
    };

    // ============================================================
    // 工具函数
    // ============================================================
    function safeCall(fn) {
        if (typeof fn === 'function') {
            try {
                return fn.apply(null, Array.prototype.slice.call(arguments, 1));
            } catch (e) {
                console.error('[Shop] 调用出错:', e);
            }
        }
        return undefined;
    }

    function getSubCategories(mainId) {
        return classTree.children[String(mainId)] || [];
    }

    function isEmptyCategory(subs) {
        if (Array.isArray(subs)) return subs.length === 0;
        return Object.keys(subs || {}).length === 0;
    }

    // ============================================================
    // 分类导航逻辑
    // ============================================================

    /**
     * 根据主分类ID获取主分类信息
     */
    function getMainCategory(mainId) {
        mainId = parseInt(mainId, 10);
        if (Array.isArray(classTree.main)) {
            for (var i = 0; i < classTree.main.length; i++) {
                if (parseInt(classTree.main[i].cid, 10) === mainId) {
                    return classTree.main[i];
                }
            }
        } else if (classTree.main[mainId]) {
            return classTree.main[mainId];
        }
        return null;
    }

    /**
     * 填充子分类下拉框
     */
    function populateSubCategorySelect($select, subs) {
        $select.empty().append('<option value="">全部分类</option>');

        var addOption = function(value, text) {
            $select.append('<option value="' + value + '">' + text + '</option>');
        };

        if (Array.isArray(subs)) {
            subs.forEach(function(item) {
                addOption(item.cid, item.name);
            });
        } else {
            for (var scid in subs) {
                if (subs.hasOwnProperty(scid)) {
                    addOption(scid, subs[scid]);
                }
            }
        }
    }

    /**
     * 显示匹配主分类的商品
     */
    function showProductsForCategory(mainId) {
        var mainIdStr = String(mainId);
        var visible = 0;

        if (typeof window.filterProducts === 'function') {
            visible = safeCall(window.filterProducts);
        }

        if (visible === 0 && typeof jQuery !== 'undefined') {
            $('#projectList .projectItem').each(function() {
                var $p = $(this);
                var pm = String($p.attr('data-main-category') || '');
                var pc = String($p.attr('data-category') || '');
                var matches = pm === mainIdStr &&
                    (!state.currentSubId || pc === String(state.currentSubId));
                if (matches) {
                    $p.removeClass('hidden').css({ display: 'flex', visibility: 'visible', opacity: '1' });
                    visible++;
                }
            });
            safeCall(window.sortHotProductsFirst);
        }
        return visible;
    }

    /**
     * 进入主分类视图
     */
    function enterMainCategory(mainId) {
        var mainInfo = getMainCategory(mainId);
        if (!mainId || !mainInfo) return;

        state.currentMainId = parseInt(mainId, 10);
        state.currentSubId = '';
        state.homepage = false;

        // 切换视图可见性
        $('#homeMainView').hide();
        $('#shopContentView').show();
        $('#queryFormContainer').hide();
        $('#branch-site-content').hide();
        $('#shopActionButtons').show();
        $('#projectList').show();
        $('#searchAndCategoryContainer').show();
        $('#skill').show();

        // 更新标题
        $('#categoryTitle').text(mainInfo.name);

        // 填充子分类
        var subs = getSubCategories(mainId);
        var $select = $('#categorySelect');
        var $box = $('#subCategoryBox');

        populateSubCategorySelect($select, subs);

        if (isEmptyCategory(subs)) {
            $box.hide();
        } else {
            $box.show();
            $('.category-filter-container .category-label').text(CONFIG.DEFAULT_CATEGORY_LABEL);
        }

        $select.val('');
        state.currentSubId = '';

        // 显示对应商品
        showProductsForCategory(mainId);

        // 滚动到商品区
        $('html, body').animate(
            { scrollTop: $('#shopContentView').offset().top - CONFIG.SCROLL_TOP_OFFSET },
            CONFIG.SCROLL_ANIMATE_DURATION
        );
    }

    /**
     * 返回首页主视图
     */
    function showHomeMainView() {
        state.currentMainId = 0;
        state.currentSubId = '';
        state.homepage = true;

        $('#shopContentView').hide();
        $('#homeMainView').show();
        $('#queryFormContainer').hide();
        $('#branch-site-content').hide();
        $('#projectList .projectItem').each(function() { $(this).hide(); });

        $('html, body').animate({ scrollTop: 0 }, 300);
        setTimeout(alignHomeMainCategories, 100);
    }

    /**
     * 对齐首页主分类（根据左侧QQ块位置动态调整）
     */
    function alignHomeMainCategories() {
        if (!$('#homeMainView').is(':visible')) return;

        var $body = $('.home-main-body');
        if (!$body.length) return;

        if ($(window).width() <= 800) {
            $body.css('margin-top', '0');
            return;
        }

        var $qqBlock = $('.zyyo-left .left-div').eq(1);
        var $header = $('.site-header-home');
        if (!$qqBlock.length) return;

        var $homeBtns = $('#homeActionButtons');
        var $welcome = $('.home-welcome-banner');

        var qqTop = $qqBlock.offset().top;
        var bodyTop = $header.offset().top +
            $header.outerHeight(true) +
            ($homeBtns.length ? $homeBtns.outerHeight(true) : 0) +
            ($welcome.length ? $welcome.outerHeight(true) : 0);

        var offset = Math.max(0, Math.round(qqTop - bodyTop));
        $body.css('margin-top', offset + 'px');
    }

    // ============================================================
    // 弹窗功能
    // ============================================================

    function openLayerDialog(title, contentHtml, area) {
        if (typeof layer === 'undefined') {
            console.warn('[Shop] layer 组件未加载');
            return;
        }
        layer.open({
            type: 1,
            title: title,
            area: area || ['400px', '300px'],
            content: contentHtml
        });
    }

    function startGift() {
        openLayerDialog('平台抽奖',
            '<div style="padding:20px;text-align:center;">' +
                '<div id="roll">点击下方按钮开始抽奖</div><hr>' +
                '<p>' +
                    '<a class="btn btn-info" id="start" style="display:block;">开始抽奖</a>' +
                    '<a class="btn btn-danger" id="stop" style="display:none;">停止</a>' +
                '</p>' +
                '<div id="result"></div><br/>' +
                '<div class="giftlist" style="display:none;">' +
                    '<strong>最近中奖记录</strong><ul id="pst_1"></ul>' +
                '</div>' +
            '</div>'
        );
    }

    function showCustomerService() {
        openLayerDialog('在线客服',
            '<div style="padding:20px;text-align:center;color:var(--main_text_color);">' +
                '<p>客服QQ：1287124675</p>' +
                '<p>工作时间：24小时在线</p>' +
            '</div>'
        );
    }

    function showAfterSales() {
        openLayerDialog('售后进群',
            '<div style="padding:20px;text-align:center;color:var(--main_text_color);">' +
                '<p>售后QQ群：1287124675</p>' +
                '<p>工作时间：24小时在线</p>' +
            '</div>'
        );
    }

    function showSupplier() {
        openLayerDialog('供货入住',
            '<div style="padding:20px;text-align:center;color:var(--main_text_color);">' +
                '<p>供应商QQ：1287124675</p>' +
                '<p>欢迎优质供应商合作</p>' +
            '</div>'
        );
    }

    // 向后兼容
    function showOrderQuery() {
        if (typeof showOrderQueryModal === 'function') {
            showOrderQueryModal();
        }
    }

    // ============================================================
    // 支付与订单处理
    // ============================================================

    function handlePaymentSuccess() {
        window.history.replaceState({}, document.title, window.location.pathname);
        state.isPaymentSuccess = true;

        setTimeout(function() {
            showOrderQuery();
            if (typeof layer !== 'undefined') {
                layer.msg('支付成功！', { icon: 1, time: 2000 });
            }

            var urlParams = new URLSearchParams(window.location.search);
            var orderid = urlParams.get('orderid');

            if (orderid) {
                setTimeout(function() {
                    safeCall(window.pollOrderByTradeNo, orderid);
                }, CONFIG.POLL_ORDER_DELAY);
            } else {
                setTimeout(function() {
                    if ($('#submit_query').length > 0) {
                        $('#submit_query').click();
                    }
                }, CONFIG.SUBMIT_QUERY_DELAY);
            }
        }, CONFIG.PAYMENT_SUCCESS_DELAY);
    }

    function handleSessionPayment() {
        var paymentType = sessionStorage.getItem('payment_type');
        var paymentTradeNo = sessionStorage.getItem('payment_trade_no');
        var paymentUserInput = sessionStorage.getItem('payment_user_input');

        if (paymentType && paymentTradeNo && paymentUserInput) {
            sessionStorage.removeItem('payment_type');
            sessionStorage.removeItem('payment_trade_no');
            sessionStorage.removeItem('payment_user_input');

            setTimeout(function() {
                state.isPaymentSuccess = true;
                safeCall(window.jumpToOrderQuery);
            }, 1000);
            return true;
        }
        return false;
    }

    // ============================================================
    // 事件绑定
    // ============================================================

    function bindEvents() {
        // 订单查询按钮（委托绑定，避免重复）
        $(document).off('click.shopQuery').on('click.shopQuery', '#submit_query', function() {
            var qq = $('#qq3').val();
            var type = $('#searchtype').val();
            safeCall(window.queryOrder, type, qq, 1);
        });

        // 窗口大小变化时重新对齐
        $(window).off('resize.shopAlign').on('resize.shopAlign', function() {
            clearTimeout(window._alignHomeTimer);
            window._alignHomeTimer = setTimeout(alignHomeMainCategories, CONFIG.ALIGN_RESIZE_DEBOUNCE);
        });
    }

    // ============================================================
    // 初始化
    // ============================================================

    function init() {
        // Modal 提示
        if (state.isModal && typeof layer !== 'undefined') {
            layer.alert('', { icon: 1, title: '零一货源站' });
        }

        // 绑定事件
        bindEvents();

        // 检查支付状态
        var urlParams = new URLSearchParams(window.location.search);
        var buyok = urlParams.get('buyok');

        if (buyok === '1') {
            handlePaymentSuccess();
        } else if (!handleSessionPayment()) {
            // 默认显示商品列表
            safeCall(window.showProductList);
        }

        // 初始隐藏商品项并对齐
        $('#projectList .projectItem').hide();
        alignHomeMainCategories();
    }

    // ============================================================
    // 暴露到全局（保持向后兼容）
    // ============================================================
    window.zyyoClassTree = classTree;
    window.zyyoCurrentMainId = state.currentMainId;
    window.zyyoCurrentSubId = state.currentSubId;
    window.enterMainCategory = enterMainCategory;
    window.showHomeMainView = showHomeMainView;
    window.alignHomeMainCategories = alignHomeMainCategories;
    window.startGift = startGift;
    window.showCustomerService = showCustomerService;
    window.showAfterSales = showAfterSales;
    window.showSupplier = showSupplier;
    window.showOrderQuery = showOrderQuery;
    window.hashsalt = CONFIG.HASH_SALT;

    // DOM Ready 后初始化
    $(init);

})(window, jQuery);
