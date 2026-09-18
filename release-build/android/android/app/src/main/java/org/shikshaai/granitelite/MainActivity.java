package org.shikshaai.granitelite;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OfflineModelPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
