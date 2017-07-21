echo "Aggregating JavaScript files"
rm -f index.js
for f in `cat index.deps`; do cat $f >> index.js; done;
rm -f reader.js
for f in `cat reader.deps`; do cat $f >> reader.js; done;
rm -f sutra.js
for f in `cat sutra.deps`; do cat $f >> sutra.js; done;
echo "RewriteEngine on" > .htaccess
echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
