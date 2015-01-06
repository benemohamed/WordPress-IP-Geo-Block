/**
 * Avoid `console` errors in browsers that lack a console.
 *
 */
!function(){for(var e,n=function(){},o=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","timeline","timelineEnd","timeStamp","trace","warn"],i=o.length,r=window.console=window.console||{};i--;)e=o[i],r[e]||(r[e]=n)}();

/**
 * Appends a trailing slash if it does not exist at the end
 *
 */
function trailingslashit(url) {
	if (typeof(url) !== 'undefined' && url.substr(-1) === '/')
		url = url.substr(0, url.length - 1);
	return url + '/';
}

/**
 * Sanitize strings
 *
 */
function sanitize(str) {
	return (str + '').replace(/[&<>"']/g, function (match) {
		return {
			'&' : '&amp;',
			'<' : '&lt;',
			'>' : '&gt;',
			'"' : '&quot;',
			"'" : '&#39;'
		}[match];
	});
}

/**
 * Show a message
 *
 */
function message(title, msg) {
	var $text = $('#result');
	var text = $text.val() + title + ': ' + msg + "\n"
	$text.val(text);
}

/**
 * Strip tags
 *
 */
function strip_tags(html) {
/*	// remove inside the specified tags
	var tags = ['title', 'style', 'h\\d', 'a'];

	// /<tag[^>]+?\/>|<tag(.|\s)*?\/tag>/gi
	for (var regexp, i = 0; i < tags.length; i++) {
		regexp = new RegExp('<(' + tags[i] + ')(.|\\s)*?\\/\\1>', 'gi');
		html = html.replace(regexp, '');
	}

	// strip tags
	html = $('<div>').html(html).text();
*/
	// keep p tags
	var match = html.match(/<p.*?\/p>/gi);
	if (match) {
		for (var text, i = 0; i < match.length; i++) {
			// remove tags
			// http://qiita.com/miiitaka/items/793555b4ccb0259a4cb8
			if (text = match[i].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')) {
				html = text;
				break;
			}
		}
	}

	// trim spaces
	html = html.replace(/[\s]+/g, ' ');
	html = html.replace(/^[\s]+|[\s]+$/g, '');

	return html;
}

/**
 * Parse url (scheme://authority/path?query#fragment)
 *
 */
function parse_uri(uri) {
	var reg = /^(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/;
	var m = uri.match(reg);
	if (m) {
		return {
			"scheme":m[1], "authority":m[2], "path":m[3], "query":m[4], "fragment":m[5]
		};
	} else {
		return null;
	}
}

/**
 * Get a random integer of from min to max
 *
 */
function get_random_int(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Make a possibly valid IP address (IPv4)
 *
 */
function get_random_ip() {
	$ip =
		get_random_int(11, 230) + '.' +
		get_random_int( 0, 255) + '.' +
		get_random_int( 0, 255) + '.' +
		get_random_int( 0, 255);
	return $ip;
}

/**
 * Generate random IP address and check the country
 *
 */
function generate_random_ip() {
	return get_geolocation(get_random_ip());
}

function combine_ip(ip, country) {
	return ip + ' ' + country;
}

function retrieve_ip(ip) {
	ip = ip.split(' ', 2);
	ip = ip.shift();
	return ip;
}

/**
 * Get geolocation data from IP address
 *
 */
function get_geolocation(ip) {
	// These APIs need to respond `Access-Control-Allow-Origin` in header.
	var apis = [
		{
			api: 'Telize',
			url: 'http://www.telize.com/geoip/%API_IP%?callback=?',
			fmt: 'jsonp',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name' : return data.country || null;
					case 'code' : return data.country_code || null;
					case 'error': return 'not found';
				}
				return null;
			},
		}
		,{
			api: 'ip-api',
			url: 'http://ip-api.com/%API_FMT%/%API_IP%',
			fmt: 'json',
			type: 'IPv4',
			get: function (data, type) {
				switch (type) {
					case 'name' : return data.country || null;
					case 'code' : return data.countryCode || null;
					case 'error': return data.message || null;
				}
				return null;
			},
		}
		/**
		 * APIs that doesn't support CORS.
		 * These are accessed through https://developer.yahoo.com/yql/
		 */
		,{
			api: 'Pycox',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select * from %API_FMT% where url="http://ip.pycox.com/%API_FMT%/%API_IP%"&format=%API_FMT%&jsonCompat=new',
			fmt: 'json',
			type: 'IPv4',
			get: function (data, type) {
				switch (type) {
					case 'name' :
						if (typeof data.query.results.json !== 'undefined')
							return data.query.results.json.country_name;
						break;
					case 'code' :
						if (typeof data.query.results.json !== 'undefined')
							return data.query.results.json.country_code
						break;
					case 'error':
						return data.query.results.error;
				}
				return null;
			},
		}
		,{
			api: 'Nekudo',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select * from %API_FMT% where url="http://geoip.nekudo.com/api/%API_IP%"&format=%API_FMT%&jsonCompat=new',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name' :
						if (typeof data.query.results.json.country !== 'undefined')
							return data.query.results.json.country.name;
						break;
					case 'code' :
						if (typeof data.query.results.json.country !== 'undefined')
							return data.query.results.json.country.code;
						break;
					case 'error':
						return data.query.results.json.msg;
				}
				return null;
			},
		}
	];

	var api = apis[get_random_int(0, apis.length-1)];
	var url = api.url
		.replace('%API_IP%', ip)
		.replace(/%API_FMT%/g, api['fmt']);

	$.ajax({
		url: url,
		type: 'get',
		dataType: api['fmt']
	})

	.always(function (data, textStatus, errorThrown) {
		var $ip = $('#ip-address');
		var msg = api.get(data, 'name');
		if (msg)
			msg += ' (' + api.get(data, 'code') + ')';
		else
			msg = api.get(data, 'error') + ' (' + api.api + ')';
		$ip.val(combine_ip($ip.val(), msg));
	});

	return ip;
}

/**
 * Validate if the page is WordPress
 *
 */
function validate_home(url) {
	var title = 'WordPress Home';

	// Get contents
	var deferred = $.ajax({
		url: url,
		type: 'get',
		dataType: 'html'
	})

	.done(function (data, textStatus, jqXHR) {
		if (-1 !== data.indexOf('wp-content')) {
			$.cookie('home-url', url, {expires: 30});
			message(title, 'Site is OK.');
		} else {
			message(title, 'Can\'t find "wp-content".');
		}
	})

	.fail(function (jqXHR, textStatus, errorThrown) {
		message(title, jqXHR.status + ' ' + jqXHR.statusText + ' ' + textStatus);
	});

	return deferred;
}

/**
 * Validate if the comment form in the page
 *
 */
function validate_page(url, found) {
	var title = 'Single Page';

	// Get contents
	var deferred = $.ajax({
		url: url,
		type: 'get',
		dataType: 'html'
	})

	.done(function (data, textStatus, jqXHR) {
		// Extract canonical URL
		var regexp = /<link[^>]+?rel=(['"]?)canonical\1.+/i;
		var match = data.match(regexp);
		if (match && match.length) {
			var canonical = match[0].replace(/.*href=(['"]?)(.+?)\1.+/, '$2');
			if (canonical !== url) {
				url = canonical
				$('#single-page').val(url);
			}
		}

		// Extract ID of the post
		regexp = /<input[^>]+?comment_post_ID.+?>/i;
		match = data.match(regexp);
		if (match && match.length) {
			// if found then set ID into form and cookie
			var comment_post_ID = match[0].replace(/[\D]/g, '');
			$('#comment_post_ID').val(comment_post_ID);
			$.cookie('single-page', url, {expires: 30});

			if ( found )
				message(title, 'Comment form is OK.');
		} else {
			// if not found then set ID as zero
			$('#comment_post_ID').val(0);

			message(title, 'Can\'t find comment form.');
		}
	})

	.fail(function (jqXHR, textStatus, errorThrown) {
		message(title, jqXHR.status + ' ' + jqXHR.statusText + ' ' + textStatus);
	});

	return deferred;
}

/**
 * Post form data
 *
 */
function post_form(url, title, $form) {
	var adrs = retrieve_ip($('#ip-address').val());

	// Post the comment with `X-Forwarded-For` header
	$.ajax({
		url: url,
		type: 'post',
		data: $form.serialize(),
		contentType: 'application/x-www-form-urlencoded',
		dataType: 'html',
		headers: {
			'X-Forwarded-For': adrs
		}
	})

	// In case of the comment being accepted
	.done(function (data, textStatus, jqXHR) {
		message(title, jqXHR.status + ' ' + jqXHR.statusText + ' ' + textStatus);
	})

	// In case of the comment being denied
	.fail(function (jqXHR, textStatus, errorThrown) {
		var msg = strip_tags(jqXHR.responseText);
		message(title, jqXHR.status + ' ' + jqXHR.statusText + ' ' + msg);
	});
}

/**
 * Post XML data
 *
 */
function post_xml(title, url, xml) {
	var adrs = retrieve_ip($('#ip-address').val());
	xml = xml.replace(/\s*([<>])\s*/g, '$1');

	$.ajax({
		url: url,
		type: 'post',
		data: xml,
		contentType: 'application/xml',
		dataType: 'text',
		headers: {
			'X-Forwarded-For': adrs
		}
	})

	.always(function (data, textStatus, jqXHR) {
		if ('success' === textStatus) {
			message(title, jqXHR.status + ' ' + jqXHR.statusText + ' ' + textStatus);
		} else {
			message(title, data.status + ' ' + data.statusText + ' ' + textStatus);
		}
	});
}

/**
 * Post a comment to the target page
 *
 */
function post_comment(url) {
	post_form(url, 'Comment', $('#comment-form'));
}

/**
 * Post a trackback message
 *
 */
function post_trackback(url) {
	// Normalize trackback url
	var $form = $('#trackback-form');
	var $trackback = $form.find('#trackback-url');
	var trackback = parse_uri($trackback.val());
	trackback = trackback['scheme'] + '://' + trackback['authority'] + '/'

	// Every time trackback url should be changed
	$trackback.val(trackback + '#' + get_random_int(1000, 9999));

	post_form(url, 'Trackback', $form);
}

/**
 * Access to login form
 *
 */
function post_login(url) {
	post_form(url, 'Login Form', $('#login-form'));
}

/**
 * Access to admin area
 *
 */
function post_admin(url) {
	post_form(url, 'Admin Area', $('#admin-area'));
}

/**
 * Access to admin ajax
 *
 */
function post_admin_ajax(url) {
	post_form(url, 'Admin Ajax', $('#admin-ajax'));
}

/**
 * Post a pingback to XML-RPC server
 *
 */
function post_pingback(url, page) {
	var xml = $('#pingback-xml').val();
	xml = xml.replace(/%WP_HOME%/, page);
	post_xml('Pingback', url, xml);
}

/**
 * Post a remote command to XML-RPC server
 *
 */
function post_xmlrpc(url) {
	var xml = $('#xmlrpc-xml').val();
	xml = xml.replace(/%USER_NAME%/, $('#user-name').val());
	xml = xml.replace(/%PASSWORD%/, $('#password').val());
	post_xml('XML-RPC', url, xml);
}

/**
 * Post a remote command to XML-RPC server
 *
 */
function post_xmlrpc_demo(url) {
	var xml = $('#xmlrpc-demo-xml').val();
	post_xml('XML-RPC demo', url, xml);
}

/**
 * Render page based on language
 *
 */
function render_template() {
	var template = {
		'en': {
			'_main-title_': 'WordPress POST Access Emulator',
			'_page-readme_': 'After setting the followings, click <span class="highlight">Validate</span> to validate the pages.',
			'_page-settings_': 'Page Settings',
			'_home-url_': 'WordPress Home',
			'_single-page_': 'Single Page',
			'_ip-address_': 'Proxy IP Address',
			'_note-ip-address_': 'You should add <span class="highlight"><code>HTTP_X_FORWARDED_FOR</code></span> into <span class="highlight"><code>$_SERVER</code> keys for extra IPs</span> on <span class="highlight">Settings</span> tab of IP Geo Block in order to emulate the post from outside your nation.',
			'_submit-post_': 'POST Access',
			'_post-settings_': 'POST Settings',
			'_required_': 'Required',
			'_cb-post-items_': 'Select All',
			'_post-comment_': 'Post Comment',
			'_author_': 'Name',
			'_email_': 'Email',
			'_site-url_': 'Site URL',
			'_comment_': 'Comment',
			'_trackback_': 'Trackback',
			'_title_': 'Title',
			'_excerpt_': 'Excerpt',
			'_trackback-url_': 'Trackback URL',
			'_blog_name_': 'Blog Name',
			'_login_': 'Login Form',
			'_user-name_': 'User Name',
			'_password_': 'Password',
			'_admin-area_': 'Admin Area',
			'_admin-cookie_': 'Admin Cookie',
			'_admin-ajax_': 'Admin Ajax',
			'_action_': 'Action',
			'_pingback_': 'Pingback',
			'_pingback-readme_': '<span class="highlight"><code>%WP_HOME%</code></span> will be replaced with <span class="highlight">WordPress HOME</span>.',
			'_xmlrpc_': 'XML-RPC',
			'_xmlrpc-readme_': '<span class="highlight"><code>%USER_NAME%</code></span> and <span class="highlight"><code>%PASSWORD%</code></span> will be replaced with settings in <span class="highlight">Login Form</span>.',
			'_xmlrpc-demo_': 'XML-RPC Demo',
			'_end_': ''
		},
		'ja': {
			'_main-title_': 'WordPressへのPOSTアクセス',
			'_page-readme_': '以下を適切に設定した後、<span class="highlight">Validate</span> を実行し、正当性を確認して下さい。',
			'_page-settings_': 'ページ設定',
			'_home-url_': 'WordPressホーム',
			'_single-page_': 'シングルページ',
			'_ip-address_': 'プロキシアドレス',
			'_note-ip-address_': '海外からの投稿を模擬するために、IP Geo Block の <span class="highlight">設定</span> タブで、<span class="highlight">追加検証する<code>$_SERVER</code>のキー</span> に <span class="highlight"><code>HTTP_X_FORWARDED_FOR</code></span> を設定しておいて下さい。',
			'_submit-post_': 'POSTアクセス',
			'_post-settings_': 'POST設定',
			'_required_': '必須',
			'_cb-post-items_': '全選択',
			'_post-comment_': 'コメント投稿',
			'_author_': '名前',
			'_email_': 'Eメール',
			'_site-url_': 'サイトURL',
			'_comment_': 'コメント',
			'_trackback_': 'トラックバック',
			'_title_': 'タイトル',
			'_excerpt_': '抜粋',
			'_trackback-url_': 'トラックバックURL',
			'_blog_name_': 'ブログ名',
			'_login_': 'ログインフォーム',
			'_user-name_': 'ユーザー名',
			'_password_': 'パスワード',
			'_admin-area_': '管理領域',
			'_admin-cookie_': '管理者クッキー',
			'_admin-ajax_': '管理領域のAjax',
			'_action_': 'アクション',
			'_pingback_': 'ピンバック',
			'_pingback-readme_': '<span class="highlight"><code>%WP_HOME%</code></span> は <span class="highlight">WordPressホーム</span> の設定値に置き換えられます。',
			'_xmlrpc_': 'XML-RPC',
			'_xmlrpc-readme_': '<span class="highlight"><code>%USER_NAME%</code></span>、<span class="highlight"><code>%PASSWORD%</code></span> は <span class="highlight">ログインフォーム</span> の設定値に置き換えられます。',
			'_xmlrpc-demo_': 'XML-RPC デモ',
			'_end_': ''
		}
	};

	// http://leonidas.github.io/transparency/
	var directives = {
		'_page-readme_':     { html: function() { return this['_page-readme_'];     } },
		'_pingback-readme_': { html: function() { return this['_pingback-readme_']; } },
		'_xmlrpc-readme_':   { html: function() { return this['_xmlrpc-readme_'];   } },
		'_note-ip-address_': { html: function() { return this['_note-ip-address_']; } }
	};

	var lang = window.navigator.userLanguage || window.navigator.language;
	lang = (lang.indexOf('ja') !== -1 ? 'ja' : 'en');
//	lang = 'en';

	$('body').render(template[lang], directives);
}

/**
 * Initialize Page Settings
 *
 */
function setup_page_settings() {
	// Set Ajax Options
	$.ajaxSetup({
		timeout: 10000
	});

	// WordPress Home
	var $home = $('#home-url');
	var home = $.cookie('home-url');
	if (home)
		$home.val(home);
	else
		home = $home.val();

	if (!home) {
		home = parse_uri(location.href);
		home = home['scheme'] + '://' + home['authority'] + '/';
		$home.val(home);
	}

	// Single Page
	var $page = $('#single-page');
	var page = $.cookie('single-page');
	if (page)
		$page.val(page)
	else
		page = $page.val();

	if (!page) {
		page = trailingslashit(home) + '?p=0';
		$page.val(page);
	}

	// Proxy IP Address
	var $adrs = $('#ip-address');
	if (!$adrs.val()) {
		$adrs.val(generate_random_ip());
	}
}

/**
 * Main
 *
 */
$(function () {
	// Render page based on language
	render_template();

	// Initialize Page Settings
	setup_page_settings();

	// Validate WordPress Home
	$('#validate-home-url').on('click', function (event) {
		validate_home($('#home-url').val());
	});

	// Validate Single Page
	$('#validate-single-page').on('click', function (event) {
		validate_page($('#single-page').val(), true);
	});

	// Generate IP Address
	$('#ip-generate').on('click', function () {
		$('#ip-address').val(generate_random_ip());
	});

	// Reset textarea
	$('#reset').on('click', function (event) {
		$('#result').val('');
	});

	// POST Settings
	$('.collapse').on('click', function (event) {
		$(this).nextAll('.post-form').toggle('fast');
	});

	// Toggle POST Items
	$('#cb-post-items').on('click', function (event) {
		var $this = $(this);
		var checked = $this.prop('checked');
		$this.parent().nextAll()
			.find('input[type=checkbox]').prop('checked', checked);
	});

	// Submit POST Access
	$('#submit').on('click', function (event) {
		var home = trailingslashit($('#home-url').val());
		var page = trailingslashit($('#single-page').val());

		// Post Comment
		if ($('#cb-comment').prop('checked')) {
			validate_page($('#single-page').val(), false).then(function() {
				post_comment(home + 'wp-comments-post.php');
			});
		}

		// Trackback
		if ($('#cb-trackback').prop('checked')) {
			validate_page($('#single-page').val(), false).then(function() {
				post_trackback(page + 'trackback/');
			});
		}

		// Login Form
		if ($('#cb-login').prop('checked'))
			post_login(home + 'wp-login.php');

		// Admin Area
		if ($('#cb-admin-area').prop('checked'))
			post_admin(home + 'wp-admin/');

		// Admin Ajax
		if ($('#cb-admin-ajax').prop('checked'))
			post_admin_ajax(home + 'wp-admin/admin-ajax.php');

		// Pingback
		if ($('#cb-pingback').prop('checked'))
			post_pingback(home + 'xmlrpc.php', page);

		// XML-RPC
		if ($('#cb-xmlrpc').prop('checked'))
			post_xmlrpc(home + 'xmlrpc.php');

		// XML-RPC Demo
		if ($('#cb-xmlrpc-demo').prop('checked'))
			post_xmlrpc_demo(home + 'xmlrpc.php');
	});
});