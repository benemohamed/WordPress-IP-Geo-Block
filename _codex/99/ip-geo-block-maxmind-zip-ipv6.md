---
layout: page
category: codex
section: customizing
title: ip-geo-block-maxmind-zip-ipv6
file: [class-maxmind.php]
---

The URI to MaxMind GeoLite Legacy database for IPv6.

<!--more-->

### Description ###

The filter hook "**ip-geo-block-maxmind-zip-ipv6**" assigns the URI to 
[Free GeoLite Legacy database file][MaxMindGeoDB] for IPv6 which can be 
downloaded by GZIP format.

### Default value ###

{% highlight text %}
http://geolite.maxmind.com/download/geoip/database/GeoIPv6.dat.gz
{% endhighlight %}

### Use case ###

The following code snippet in your theme's `functions.php` can download the 
city database for IPv6.

{% highlight php startinline %}
function my_maxmind_ipv6( $url ) {
    return 'http://geolite.maxmind.com/download/geoip/database/GeoLiteCityv6-beta/GeoLiteCityv6.dat.gz';
}
add_filter( 'ip-geo-block-maxmind-zip-ipv6', 'my_maxmind_ipv6' );
{% endhighlight %}

### Since ###

1.2.0

### See also ###

- [ip-geo-block-api-dir][CodexApiDir]
- [ip-geo-block-maxmind-dir][CodexMaxDir]
- [ip-geo-block-maxmind-zip-ipv4][CodexMaxZip4]

[IP-Geo-Block]: https://wordpress.org/plugins/ip-geo-block/ "WordPress › IP Geo Block « WordPress Plugins"
[MaxMindGeoDB]: http://dev.maxmind.com/geoip/legacy/geolite/ "GeoLite Legacy Downloadable Databases « Maxmind Developer Site"
[CodexApiDir]:  {{ '/codex/ip-geo-block-api-dir.html'          | prepend: site.baseurl }} 'ip-geo-block-api-dir | IP Geo Block'
[CodexMaxDir]:  {{ '/codex/ip-geo-block-maxmind-dir.html'      | prepend: site.baseurl }} 'ip-geo-block-maxmind-dir | IP Geo Block'
[CodexMaxZip4]: {{ '/codex/ip-geo-block-maxmind-zip-ipv4.html' | prepend: site.baseurl }} 'ip-geo-block-maxmind-zip-ipv4 | IP Geo Block'