$(function() {
	var ce = chrome.extension;
	var bg_win = ce.getBackgroundPage();
	var PREFiX = bg_win.PREFiX;
	var lscache = bg_win.lscache;

	$('#switch-account').click(function(e) {
		PREFiX.reset();
		close();
	});
	$('#version').text(PREFiX.version);

	var current = PREFiX.settings.current;

	$('[key]').each(function() {
		var $item = $(this);
		var key = $item.attr('key');
		var value = current[key];
		switch ($item.attr('type')) {
			case 'checkbox':
				$item.prop('checked', value);
				break;
			case 'select':
				$item.val(value);
				break;
			case 'range':
				$item.val(value + '');
				break;
		}
	});

	$('[foldable-src]').on('change', function(e) {
		var type = $(this).attr('foldable-src');
		$('[foldable-tgt="' + type + '"]').prop('hidden', ! this.checked);
	}).trigger('change');

	var $volume = $('#volume');
	$('[key="volume"]').on('change', function(e) {
		var volume = +$(this).val();
		$volume.text(parseInt(volume * 100, 10) + '%');
		PREFiX.settings.current.volume = volume;
	}).trigger('change');

	var $play_sound = $('[key="playSound"]');
	$play_sound.on('change', function(e) {
		var checked = $play_sound.prop('checked');
		$('[key="volume"]').prop('disabled', ! checked);
	}).trigger('change');

	$('#playSound').click(function(e) {
		bg_win.playSound(true);
	});

	var $auto_flush_cache = $('[key="autoFlushCache"]');
	var $cache_amount = $('[key="cacheAmount"]');

	$auto_flush_cache.on('change', function(e) {
		var checked = $auto_flush_cache.prop('checked');
		$cache_amount.prop('disabled', ! checked);
	}).trigger('change');

	$cache_amount.on('change', function(e) {
		$('#cacheAmount').text($cache_amount.val());
	}).trigger('change');

	if (PREFiX.account) {
		$('#username').
		text('@' + PREFiX.account.name + ' (' + PREFiX.account.id + ')').
		prop('href', 'http://fanfou.com/' + PREFiX.account.id);
	} else {
		$('#user-info').text('您还没有登录饭否账号，请点击下面的按钮继续。')
		$('#switch-account').text('登入账号');
	}

	var last_used_page = lscache.get('last_used_page') || 0;
	$('#navbar li').each(function(i) {
		var $item = $(this);
		$item.click(function(e) {
			$('#navbar li').removeClass('current');
			$('.page').removeClass('current');
			$item.addClass('current');
			var page = $item.prop('id') + '-page';
			$('#' + page).addClass('current');
			lscache.set('last_used_page', i);
		});
	}).eq(last_used_page).click();

	var custom_consumer = lscache.get('custom_consumer');
	if (custom_consumer) {
		$('#key').val(custom_consumer.key);
		$('#secret').val(custom_consumer.secret);
	} else {
		custom_consumer = { };
	}
	$('#set-consumer').click(function(e) {
		var key = $('#key').val().trim();
		var secret = $('#secret').val().trim();
		if (! key || ! secret) return;
		if (key === custom_consumer.key ||
			secret === custom_consumer.secret) {
			alert('您已经成功设置了尾巴, 不需要重复设置. :)');
			return;
		}
		bg_win.enableCustomConsumer(key, secret);
	});
	$('#reset-consumer').click(function(e) {
		bg_win.disableCustomConsumer();
		location.reload();
	});

	var $usage_tip_list = $('#usage-tip-page ol').first();
	bg_win.usage_tips.forEach(function(tip) {
		var $li = $('<li />');
		$li.html(tip);
		$li.appendTo($usage_tip_list);
	});

	$('#status-count').text(bg_win.getStatusCount());
	$('#photo-count').text(bg_win.getPhotoCount());

	var install_time = lscache.get('install_time');
	install_time = bg_win.getYMD(install_time);
	$('#install-time').text(install_time);

	$('#show-updates').click(function(e) {
		var update = [];
		var history = bg_win.history;
		Object.keys(history).forEach(function(version) {
			update.push('# ' + version + ' #');
			update.push.apply(update, history[version]);
			update.push('');
		});
		alert(update.join('\n'));
	});

	onunload = function(e) {
		$('[key]').each(function() {
			var $item = $(this);
			var key = $item.attr('key');
			var value;
			switch ($item.attr('type')) {
				case 'checkbox':
					value = $item.prop('checked');
					break;
				case 'select':
					value = $item.val();
					break;
				case 'range':
					value = +$item.val();
					break;
			}
			current[key] = value;
		});
		PREFiX.settings.save();
		PREFiX.settings.onSettingsUpdated();
	}
});