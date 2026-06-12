Subject: Delhivery webhook requirement forms and final ChoiceMee endpoint alignment

Hi Team,

Please find the filled webhook requirement documents attached for the ChoiceMee production setup:

- Scan Push Webhook Requirement Document
- EPOD Webhook Requirement Document
- Sorter Image Webhook Requirement Document
- QC Image Webhook Requirement Document

Final production webhook base:
https://api.choicemee.in

Aligned endpoints:
- Scan push: https://api.choicemee.in/api/webhook/delhivery/scan-push
- NDR: https://api.choicemee.in/api/webhook/delhivery/ndr
- RTO: https://api.choicemee.in/api/webhook/delhivery/rto
- Weight discrepancy: https://api.choicemee.in/api/webhook/delhivery/weight-discrepancy
- EPOD: https://api.choicemee.in/api/webhook/delhivery/epod
- Sorter image: https://api.choicemee.in/api/webhook/delhivery/sorter-image
- QC image: https://api.choicemee.in/api/webhook/delhivery/qc-image

Required header:
X-Delhivery-Webhook-Secret: <shared-secret>

A single VPS-backed production ingress is currently exposed through api.choicemee.in. If you need a separate dev host, we can add one next.

Please review the escalation matrix placeholders and share the exact L1/L2/L3 contact names, email addresses, and phone numbers if you want us to replace the current placeholders before submission.

Thanks,
ChoiceMee Team