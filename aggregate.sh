echo "Aggregating JavaScript files"
rm -f index.js
for f in `cat index.deps`; do cat $f >> index.js; done;
echo "RewriteEngine on" > .htaccess
echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
