from pathlib import Path
import html,re
root=Path(__file__).resolve().parents[1]/'case-clash'
p=root/'index.html';s=p.read_text()
s=re.sub(r'<style id="mobile-responsive">.*?</style>','',s,flags=re.S)
s=s.replace('</head>','<style id="mobile-responsive">'+(root/'mobile.css').read_text()+'</style></head>')
s=re.sub(r'<script>.*?</script>',lambda m:'<script>'+ (root/'app.js').read_text()+'</script>',s,flags=re.S)
p.write_text(s)
for w,h in [(390,844),(393,852),(430,932)]:
 name='mobile-preview.html' if w==390 else f'mobile-preview-{w}.html'
 (root/name).write_text(f'<!doctype html><html><head><meta charset="utf-8"><title>CASE CLASH · {w} × {h} QA</title><style>body{{margin:0;background:#171923;color:#ccc;font:14px sans-serif;text-align:center}}iframe{{display:block;width:{w}px;height:{h}px;border:0;margin:16px auto;background:#05080e}}</style></head><body><p>CASE CLASH · viewport {w} × {h}</p><iframe title="iPhone viewport" srcdoc="'+html.escape(s,quote=True)+'"></iframe></body></html>')
