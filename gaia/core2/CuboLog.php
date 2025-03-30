<?php
namespace Core;
use Exception;
/**
db gen_localost data installed from gen_admin tables main, pagecubo, pagegrp
and constructs the web UI of any domain

1) installCuboPublic($domain)

*/
trait CuboLog {


    // Retrieve cubos logs
    protected function getCuboLogs(int $widgetId): array {
        return $this->db->fa('SELECT * FROM gen_admin.cubo_logs WHERE widget_id =? ',[$widgetId]);
    }

    protected function getSystemLogsBuffer(): ?array {
       $buffer = array();
        $sel = array();
		$query='SELECT systems.*,system_ver.* FROM gen_admin.systems left join system_ver ON systems.id=system_ver.systemsid ';
		$selsystems=$this->db->fa($query);
			for($i=0;$i<count($selsystems);$i++) {
				$sel[$selsystems[$i]["systemsid"]][]=$selsystems[$i];
			}
        // Create buffer for output
        $buffer['count'] = count($selsystems);
        $buffer['list'] = $sel;
    //    $buffer['html'] = $this->include_buffer(ADMIN_ROOT."main/admin/system_buffer.php", $sel);
        return $buffer;
    }


}